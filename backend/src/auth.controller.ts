import { BadRequestException, Body, ConflictException, Controller, ForbiddenException, Get, Header, Logger, Param, Post, Query, Req, Res, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { Request, Response } from 'express';
import { PrismaService } from './prisma.service.js';

const stateCookie = 'amanah_google_state';
const deriveKey = promisify(scrypt);
const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
const stateOptions = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/auth/google/callback' };

@Controller('auth')
export class AuthController {
  private readonly jwt = new JwtService();
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly prisma: PrismaService) {}

  private config() {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL, JWT_SECRET, FRONTEND_URL } = process.env;
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL || !JWT_SECRET || JWT_SECRET.length < 32) {
      throw new ServiceUnavailableException('Google sign-in is not configured');
    }
    return {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callback: GOOGLE_CALLBACK_URL,
      secret: JWT_SECRET,
      frontend: new URL(FRONTEND_URL ?? 'http://localhost:5173').origin,
    };
  }

  @Get('google')
  start(@Res() response: Response) {
    const config = this.config();
    const state = randomBytes(32).toString('hex');
    response.cookie(stateCookie, state, { ...stateOptions, maxAge: 600_000 });
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.callback,
      response_type: 'code',
      scope: 'openid email profile',
      state,
    });
    response.redirect('https://accounts.google.com/o/oauth2/v2/auth?' + params);
  }

  @Get('google/callback')
  async callback(@Req() request: Request, @Res() response: Response) {
    const config = this.config();
    const { code, state } = request.query;
    const expected = request.headers.cookie?.match(/(?:^|;\s*)amanah_google_state=([a-f0-9]{64})(?:;|$)/)?.[1];
    response.clearCookie(stateCookie, stateOptions);
    response.setHeader('Cache-Control', 'no-store');
    if (!expected || expected !== state || typeof code !== 'string') {
      response.redirect(config.frontend + '/#auth_error=google');
      return;
    }

    try {
      const exchange = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        body: new URLSearchParams({
          code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: config.callback,
          grant_type: 'authorization_code',
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!exchange.ok) throw new Error('Token exchange failed');
      const tokens = await exchange.json() as { access_token?: string };
      if (!tokens.access_token) throw new Error('Google access token missing');

      const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: 'Bearer ' + tokens.access_token },
        signal: AbortSignal.timeout(10000),
      });
      if (!profileResponse.ok) throw new Error('Profile lookup failed');
      const profile = await profileResponse.json() as {
        sub?: string; email?: string; email_verified?: boolean; name?: string; picture?: string;
      };
      if (!profile.sub || !profile.email || profile.email_verified !== true) throw new Error('Verified Google email required');

      const user = await this.prisma.client.user.upsert({
        where: { googleId: profile.sub },
        create: { googleId: profile.sub, email: profile.email.toLowerCase(), name: profile.name, avatarUrl: profile.picture },
        update: { name: profile.name, avatarUrl: profile.picture },
        select: { id: true },
      });
      const token = await this.session(user.id);
      response.redirect(config.frontend + '/#session=' + encodeURIComponent(token));
    } catch {
      this.logger.warn('Google sign-in callback failed');
      response.redirect(config.frontend + '/#auth_error=google');
    }
  }

  private session(userId: string) {
    return this.jwt.signAsync({ sub: userId }, {
      secret: this.config().secret, algorithm: 'HS256', issuer: 'amanah', audience: 'amanah-web', expiresIn: '1h',
    });
  }

  @Post('email/register')
  @Header('Cache-Control', 'no-store')
  async registerEmail(@Body('email') address: unknown) {
    const email = this.normalizeEmail(address);
    const { RESEND_API_KEY, AUTH_EMAIL_FROM } = process.env;
    if (!RESEND_API_KEY || !AUTH_EMAIL_FROM) throw new ServiceUnavailableException('Email registration is not configured');
    const { frontend } = this.config();
    const result = { message: 'If this address can be registered, you will receive an email with the next step.' };
    const database = this.prisma.client;
    if (await database.user.findUnique({ where: { email }, select: { id: true } })) return result;

    const token = randomBytes(32).toString('hex');
    const hash = tokenHash(token);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60_000);
    const updated = await database.pendingEmailRegistration.updateMany({
      where: { email, createdAt: { lte: new Date(now.getTime() - 60_000) } },
      data: { tokenHash: hash, createdAt: now, expiresAt },
    });
    if (!updated.count) {
      try {
        await database.pendingEmailRegistration.create({ data: { email, tokenHash: hash, createdAt: now, expiresAt } });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return result;
        throw error;
      }
    }
    try {
      const delivery = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: AUTH_EMAIL_FROM, to: [email], subject: 'Verify your Amanah email',
          text: 'Open this link within 30 minutes to set your Amanah password: ' + frontend + '/#verify_email=' + token,
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!delivery.ok) throw new Error('Email delivery failed');
    } catch {
      await database.pendingEmailRegistration.deleteMany({ where: { email, tokenHash: hash } });
      throw new ServiceUnavailableException('Could not send verification email. Try again later');
    }
    return result;
  }

  @Post('email/verify')
  @Header('Cache-Control', 'no-store')
  async verifyEmail(@Body('token') token: unknown, @Body('password') password: unknown) {
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) throw new BadRequestException('Invalid verification link');
    if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
      throw new BadRequestException('Use a password with 12 to 128 characters');
    }
    const hash = tokenHash(token);
    const database = this.prisma.client;
    const pending = await database.pendingEmailRegistration.findUnique({ where: { tokenHash: hash } });
    if (!pending || pending.expiresAt <= new Date()) throw new BadRequestException('Verification link expired or was already used');
    const salt = randomBytes(16).toString('hex');
    const key = await deriveKey(password, salt, 64) as Buffer;
    try {
      const user = await database.$transaction(async (tx) => {
        const consumed = await tx.pendingEmailRegistration.deleteMany({
          where: { tokenHash: hash, expiresAt: { gt: new Date() } },
        });
        if (!consumed.count) throw new BadRequestException('Verification link expired or was already used');
        return tx.user.create({
          data: { email: pending.email, passwordHash: salt + ':' + key.toString('hex') },
          select: { id: true },
        });
      });
      return { session: await this.session(user.id) };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('An account already exists for this email. Use your original sign-in method');
      }
      throw error;
    }
  }

  @Post('email/login')
  @Header('Cache-Control', 'no-store')
  async loginEmail(@Body('email') address: unknown, @Body('password') password: unknown) {
    const email = this.normalizeEmail(address);
    if (typeof password !== 'string' || password.length > 128) throw new UnauthorizedException('Invalid email or password');
    const user = await this.prisma.client.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });
    const [salt, hash] = (user?.passwordHash ?? '00000000000000000000000000000000:' + '0'.repeat(128)).split(':');
    const key = await deriveKey(password, salt, 64) as Buffer;
    if (!timingSafeEqual(key, Buffer.from(hash, 'hex')) || !user?.passwordHash) throw new UnauthorizedException('Invalid email or password');
    return { session: await this.session(user.id) };
  }

  private normalizeEmail(address: unknown) {
    const email = typeof address === 'string' ? address.trim().toLowerCase() : '';
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BadRequestException('Enter a valid email address');
    return email;
  }

  @Get('me')
  @Header('Cache-Control', 'no-store')
  me(@Req() request: Request) {
    return this.account(request);
  }

  @Get('eligibility')
  @Header('Cache-Control', 'no-store')
  async eligibility(@Req() request: Request) {
    const user = await this.account(request);
    const eligibility = await this.prisma.client.eligibilityCase.findUnique({
      where: { applicantId: user.id },
      select: { status: true, additionalInformation: true },
    });
    return { eligibility };
  }

  @Post('eligibility')
  @Header('Cache-Control', 'no-store')
  async submitEligibility(@Req() request: Request, @Body() body: unknown) {
    const user = await this.account(request);
    if (!body || typeof body !== 'object') throw new BadRequestException('Enter your household details');
    const fields = body as Record<string, unknown>;
    const { locality, postalCode, householdSize, monthlyIncomePaise, monthlyExpensesPaise, mahallId } = fields;
    if (typeof locality !== 'string' || !locality.trim() || locality.trim().length > 120 ||
        typeof postalCode !== 'string' || !/^\d{6}$/.test(postalCode) ||
        !this.isInteger(householdSize, 1, 100) ||
        !this.isInteger(monthlyIncomePaise, 0, 2147483647) ||
        !this.isInteger(monthlyExpensesPaise, 0, 2147483647) ||
        (mahallId !== null && (typeof mahallId !== 'string' || mahallId.length > 36))) {
      throw new BadRequestException('Check the locality, six-digit PIN code, household size and amounts');
    }

    const reviewingMahallId = user.mahallId ?? mahallId;
    try {
      const [, eligibility] = await this.prisma.client.$transaction([
        this.prisma.client.user.update({
          where: { id: user.id, mahallId: user.mahallId },
          data: { mahallId: reviewingMahallId },
          select: { id: true },
        }),
        this.prisma.client.eligibilityCase.create({
          data: { applicantId: user.id, reviewingMahallId, locality: locality.trim(), postalCode, householdSize, monthlyIncomePaise, monthlyExpensesPaise },
          select: { status: true },
        }),
      ]);
      return { eligibility };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') throw new ConflictException('Your eligibility case has already been submitted');
        if (error.code === 'P2003') throw new BadRequestException('Select a registered Mahallu or no home Mahallu');
        if (error.code === 'P2025') throw new ConflictException('Your membership changed. Reload and try again');
      }
      throw error;
    }
  }

  private isInteger(value: unknown, min: number, max: number): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
  }

  @Post('calculator')
  calculate(@Body() input: unknown) {
    if (!input || typeof input !== 'object') throw new BadRequestException('Enter your Zakat calculation details');
    const { cash, metals, business, investments, debts, nisab, hawl } = input as Record<string, unknown>;
    const limit = 100_000_000_000;
    if (!this.isInteger(cash, 0, limit) || !this.isInteger(metals, 0, limit) ||
        !this.isInteger(business, 0, limit) || !this.isInteger(investments, 0, limit) ||
        !this.isInteger(debts, 0, limit) || !this.isInteger(nisab, 1, limit) ||
        typeof hawl !== 'boolean') {
      throw new BadRequestException('Enter valid amounts and a positive Nisab threshold');
    }
    const assets = cash + metals + business + investments;
    const net = Math.max(assets - debts, 0);
    const thresholdReached = net >= nisab;
    return { assets, debts, net, thresholdReached, due: thresholdReached && hawl ? Math.round(net / 40) : 0 };
  }

  @Get('review')
  @Header('Cache-Control', 'no-store')
  async reviewQueue(@Req() request: Request) {
    const reviewer = await this.reviewer(request);
    return this.prisma.client.eligibilityCase.findMany({
      where: reviewer.role === 'SUPER_ADMIN' ? {} : { reviewingMahallId: reviewer.mahallId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 100,
      select: {
        id: true, status: true, locality: true, postalCode: true, householdSize: true,
        monthlyIncomePaise: true, monthlyExpensesPaise: true, additionalInformation: true,
        applicant: { select: { name: true, email: true, mahallId: true } },
        reviewingMahall: { select: { id: true, name: true } },
      },
    });
  }

  @Post('review/:id/assignment')
  async assignReview(@Req() request: Request, @Param('id') id: string, @Body('mahallId') mahallId: unknown) {
    const reviewer = await this.reviewer(request);
    if (reviewer.role !== 'SUPER_ADMIN') throw new ForbiddenException();
    if (mahallId !== null && (typeof mahallId !== 'string' || !mahallId || mahallId.length > 36)) {
      throw new BadRequestException('Choose a Mahallu or direct review');
    }
    if (mahallId && !await this.prisma.client.mahall.count({ where: { id: mahallId } })) {
      throw new BadRequestException('Mahallu not found');
    }
    const changed = await this.prisma.client.eligibilityCase.updateMany({
      where: { id, status: { in: ['PENDING', 'MORE_INFORMATION_REQUIRED'] }, applicant: { mahallId: null } },
      data: { reviewingMahallId: mahallId },
    });
    if (!changed.count) throw new ConflictException('Only open unaffiliated cases can be reassigned');
    return { updated: true };
  }

  @Post('review/:id/decision')
  async decideReview(
    @Req() request: Request,
    @Param('id') id: string,
    @Body('status') status: unknown,
    @Body('reason') reason: unknown,
  ) {
    const reviewer = await this.reviewer(request);
    if (status !== 'APPROVED' && status !== 'REJECTED' && status !== 'MORE_INFORMATION_REQUIRED') {
      throw new BadRequestException('Choose a valid decision');
    }
    if (typeof reason !== 'string' || !reason.trim() || reason.trim().length > 1000) {
      throw new BadRequestException('Enter a review reason of up to 1,000 characters');
    }
    const changed = await this.prisma.client.eligibilityCase.updateMany({
      where: {
        id, applicantId: { not: reviewer.id }, status: { in: ['PENDING', 'MORE_INFORMATION_REQUIRED'] },
        ...(reviewer.role === 'MAHALL_ADMIN' ? { reviewingMahallId: reviewer.mahallId } : {}),
      },
      data: { status, additionalInformation: reason.trim(), reviewedById: reviewer.id, reviewedAt: new Date() },
    });
    if (!changed.count) throw new ConflictException('This case is unavailable for review');
    return { updated: true };
  }

  @Post('mahalls')
  async createMahall(@Req() request: Request, @Body('name') name: unknown, @Body('locality') locality: unknown) {
    if ((await this.reviewer(request)).role !== 'SUPER_ADMIN') throw new ForbiddenException();
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 120 ||
        typeof locality !== 'string' || !locality.trim() || locality.trim().length > 120) {
      throw new BadRequestException('Enter a name and locality of up to 120 characters each');
    }
    return this.prisma.client.mahall.create({
      data: { name: name.trim(), locality: locality.trim() },
      select: { id: true, name: true, locality: true },
    });
  }

  private async reviewer(request: Request) {
    const user = await this.account(request);
    if (user.role !== 'SUPER_ADMIN' && (user.role !== 'MAHALL_ADMIN' || !user.mahallId)) {
      throw new ForbiddenException();
    }
    return user;
  }

  @Get('discovery')
  @Header('Cache-Control', 'no-store')
  async discover(@Query('area') area: unknown) {
    if (typeof area !== 'string' || area.trim().length < 2 || area.trim().length > 120) {
      throw new BadRequestException('Enter a locality or six-digit PIN code');
    }
    const query = area.trim();
    const match = /^\d{6}$/.test(query)
      ? Prisma.sql`e."postalCode" = ${query}`
      : Prisma.sql`strpos(lower(e."locality"), lower(${query})) > 0`;
    const offset = 330 * 60 * 1000;
    const local = new Date(Date.now() + offset);
    const monthStart = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) - offset);
    return this.prisma.client.$queryRaw<{ id: string; locality: string; priority: string; noReceipts: boolean }[]>`
      SELECT ranked.id, ranked.locality,
        CASE WHEN ranked.remaining >= 500000 THEN 'High unmet need' ELSE 'Unmet need' END AS priority,
        ranked.received = 0 AS "noReceipts"
      FROM (
        SELECT e.id, e.locality, COALESCE(receipts.amount, 0) AS received,
          e."monthlyExpensesPaise"::bigint - e."monthlyIncomePaise" - COALESCE(receipts.amount, 0) AS remaining
        FROM "EligibilityCase" e
        LEFT JOIN LATERAL (
          SELECT SUM(h."amountPaise") AS amount
          FROM "ZakatHandover" h WHERE h."caseId" = e.id AND h."confirmedAt" >= ${monthStart}
        ) receipts ON true
        WHERE e.status = 'APPROVED' AND ${match}
      ) ranked
      WHERE ranked.remaining > 0
      ORDER BY ranked.remaining DESC, ranked.received ASC, ranked.id
      LIMIT 30`;
  }

  @Post('handovers')
  async recordHandover(@Req() request: Request, @Body('caseId') caseId: unknown, @Body('amountPaise') amountPaise: unknown) {
    const giver = await this.account(request);
    if (typeof caseId !== 'string' || caseId.length > 36 || !this.isInteger(amountPaise, 1, 2147483647)) {
      throw new BadRequestException('Choose an eligible recipient and enter a positive amount');
    }
    const recipient = await this.prisma.client.eligibilityCase.findFirst({
      where: { id: caseId, status: 'APPROVED', applicantId: { not: giver.id } },
      select: { id: true },
    });
    if (!recipient) throw new ConflictException('This recipient is unavailable for a handover');
    return this.prisma.client.zakatHandover.create({
      data: { caseId, giverId: giver.id, amountPaise },
      select: { id: true, amountPaise: true, confirmedAt: true },
    });
  }

  @Get('handovers')
  @Header('Cache-Control', 'no-store')
  async handovers(@Req() request: Request) {
    const user = await this.account(request);
    const records = await this.prisma.client.zakatHandover.findMany({
      where: { OR: [{ giverId: user.id }, { eligibility: { applicantId: user.id } }] },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 50,
      select: { id: true, giverId: true, amountPaise: true, createdAt: true, confirmedAt: true },
    });
    return records.map(({ giverId, ...record }) => ({ ...record, incoming: giverId !== user.id }));
  }

  @Post('handovers/:id/confirm')
  async confirmHandover(@Req() request: Request, @Param('id') id: string) {
    const recipient = await this.account(request);
    const updated = await this.prisma.client.zakatHandover.updateMany({
      where: { id, confirmedAt: null, eligibility: { applicantId: recipient.id } },
      data: { confirmedAt: new Date() },
    });
    if (!updated.count) throw new ConflictException('This pending handover is unavailable to confirm');
    return { updated: true };
  }

  @Post('mahalls/admins')
  async assignMahallAdmin(@Req() request: Request, @Body('email') address: unknown, @Body('mahallId') mahallId: unknown) {
    if ((await this.reviewer(request)).role !== 'SUPER_ADMIN') throw new ForbiddenException();
    const email = this.normalizeEmail(address);
    if (typeof mahallId !== 'string' || !await this.prisma.client.mahall.count({ where: { id: mahallId } })) {
      throw new BadRequestException('Select a registered Mahallu');
    }
    const updated = await this.prisma.client.user.updateMany({
      where: { email, role: { in: ['USER', 'MAHALL_ADMIN'] }, OR: [{ mahallId: null }, { mahallId }] },
      data: { role: 'MAHALL_ADMIN', mahallId },
    });
    if (!updated.count) throw new ConflictException('The account must exist and belong to this Mahallu or be unaffiliated');
    return { updated: true };
  }

  private async account(request: Request) {
    const config = this.config();
    const token = request.headers.authorization?.match(/^Bearer (\S+)$/i)?.[1];
    if (!token) throw new UnauthorizedException();
    let subject: string;
    try {
      const claims = await this.jwt.verifyAsync<{ sub: string }>(token, {
        secret: config.secret, algorithms: ['HS256'], issuer: 'amanah', audience: 'amanah-web',
      });
      subject = claims.sub;
      if (typeof subject !== 'string' || !subject) throw new Error('Missing subject');
    } catch {
      throw new UnauthorizedException();
    }
    const user = await this.prisma.client.user.findUnique({
      where: { id: subject },
      select: { id: true, email: true, name: true, role: true, mahallId: true },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}

