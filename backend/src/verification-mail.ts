import { ServiceUnavailableException } from '@nestjs/common';
import nodemailer from 'nodemailer';

export function verificationMailer() {
  const { AUTH_EMAIL_FROM, RESEND_API_KEY, MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD, MAIL_SECURE, MAIL_IGNORE_TLS, MAIL_REQUIRE_TLS, MAIL_DEFAULT_EMAIL, MAIL_DEFAULT_NAME } = process.env;
  const unavailable = () => new ServiceUnavailableException('Email registration is not configured');
  const subject = 'Verify your Amanah email';

  if (MAIL_HOST) {
    const port = Number(MAIL_PORT ?? '587');
    const secure = MAIL_SECURE === undefined ? port === 465 : MAIL_SECURE === 'true';
    const ignoreTLS = MAIL_IGNORE_TLS === 'true';
    const requireTLS = MAIL_REQUIRE_TLS === undefined ? !secure : MAIL_REQUIRE_TLS === 'true';
    const address = MAIL_DEFAULT_EMAIL || MAIL_USER;
    if (!Number.isInteger(port) || port < 1 || port > 65535 || !MAIL_USER || !MAIL_PASSWORD || !address ||
        (!secure && (ignoreTLS || !requireTLS))) throw unavailable();
    const transport = nodemailer.createTransport({
      host: MAIL_HOST,
      port,
      secure,
      ignoreTLS,
      requireTLS,
      auth: { user: MAIL_USER, pass: MAIL_PASSWORD },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
    return async (to: string, text: string) => {
      const delivery = await transport.sendMail({ from: { address, name: MAIL_DEFAULT_NAME ?? '' }, to, subject, text });
      if (!delivery.accepted.length) throw new Error('SMTP rejected the recipient');
    };
  }

  if (!RESEND_API_KEY || !AUTH_EMAIL_FROM) throw unavailable();
  return async (to: string, text: string) => {
    const delivery = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: AUTH_EMAIL_FROM, to: [to], subject, text }),
      signal: AbortSignal.timeout(10000),
    });
    if (!delivery.ok) throw new Error('Email delivery failed');
  };
}
