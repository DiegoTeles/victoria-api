import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { timingSafeEqual } from 'node:crypto';
import type { Response } from 'express';
import { ADMIN_COOKIE } from '../common/constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  private secureCookie(): boolean {
    return (
      this.config.get<string>('nodeEnv') === 'production' ||
      this.config.get<boolean>('useSecureCookie') === true
    );
  }

  setAuthCookie(res: Response, token: string) {
    const maxAge = 7 * 24 * 60 * 60;
    const secure = this.secureCookie() ? '; Secure' : '';
    res.setHeader(
      'Set-Cookie',
      `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`,
    );
  }

  clearAuthCookie(res: Response) {
    const secure = this.secureCookie() ? '; Secure' : '';
    res.setHeader(
      'Set-Cookie',
      `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
    );
  }

  private safeEqual(a: string, b: string): boolean {
    const ba = Buffer.from(String(a), 'utf8');
    const bb = Buffer.from(String(b), 'utf8');
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  }

  login(password: string, res: Response) {
    const expected = this.config.get<string>('adminPassword');
    if (!expected) {
      throw new InternalServerErrorException('Server misconfigured');
    }
    const expectedTrim = String(expected).trim();
    if (!this.safeEqual(String(password ?? '').trim(), expectedTrim)) {
      throw new UnauthorizedException('Invalid password');
    }
    const token = this.jwt.sign({ role: 'admin' });
    this.setAuthCookie(res, token);
    return { ok: true };
  }

  verifyToken(raw: string | undefined): boolean {
    if (!raw) return false;
    try {
      const p = this.jwt.verify<{ role?: string }>(raw);
      return p.role === 'admin';
    } catch {
      return false;
    }
  }

  extractToken(req: { headers: { authorization?: string; cookie?: string }; cookies?: object }) {
    const auth = req.headers.authorization;
    const bearer = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    const cookies = req.cookies as Record<string, string> | undefined;
    const cookieTok = typeof cookies?.[ADMIN_COOKIE] === 'string' ? cookies[ADMIN_COOKIE] : '';
    return bearer || cookieTok;
  }
}
