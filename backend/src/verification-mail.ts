import { ServiceUnavailableException } from '@nestjs/common';
import nodemailer from 'nodemailer';

export function verificationMailer() {
  const { AUTH_EMAIL_FROM, RESEND_API_KEY, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  const unavailable = () => new ServiceUnavailableException('Email registration is not configured');
  if (!AUTH_EMAIL_FROM) throw unavailable();
  const from = AUTH_EMAIL_FROM;
  const subject = 'Verify your Amanah email';

  if (SMTP_HOST) {
    const port = Number(SMTP_PORT ?? '587');
    if (!Number.isInteger(port) || port < 1 || port > 65535 || !SMTP_USER || !SMTP_PASS) throw unavailable();
    const transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
    return async (to: string, text: string) => {
      const delivery = await transport.sendMail({ from, to, subject, text });
      if (!delivery.accepted.length) throw new Error('SMTP rejected the recipient');
    };
  }

  if (!RESEND_API_KEY) throw unavailable();
  return async (to: string, text: string) => {
    const delivery = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, text }),
      signal: AbortSignal.timeout(10000),
    });
    if (!delivery.ok) throw new Error('Email delivery failed');
  };
}
