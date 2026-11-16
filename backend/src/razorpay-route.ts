import { BadGatewayException, ServiceUnavailableException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';

export function razorpayConfig() {
  const { RAZORPAY_KEY_ID: key, RAZORPAY_KEY_SECRET: secret, RAZORPAY_WEBHOOK_SECRET: webhook } = process.env;
  return key && secret && webhook ? { key, secret, webhook } : null;
}

export function validRazorpaySignature(payload: string | Buffer, signature: unknown, secret: string) {
  if (typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(payload).digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}

export async function razorpayRequest<T>(path: string, body?: object): Promise<T> {
  const config = razorpayConfig();
  if (!config) throw new ServiceUnavailableException('Online giving is not configured');
  try {
    const response = await fetch('https://api.razorpay.com/v1/' + path, {
      method: body ? 'POST' : 'GET',
      headers: {
        Authorization: 'Basic ' + Buffer.from(config.key + ':' + config.secret).toString('base64'),
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error();
    return await response.json() as T;
  } catch {
    throw new BadGatewayException('Could not reach Razorpay. Try again or check your giving history.');
  }
}

type Transfer = { recipient?: string; amount?: number; currency?: string; status?: string; transfer_status?: string; amount_reversed?: number };
export type RouteOrder = {
  id: string;
  amount: number;
  amount_paid: number;
  currency: string;
  status: string;
  transfers?: { items?: Transfer[] } | Transfer[];
};
