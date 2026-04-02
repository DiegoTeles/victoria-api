import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { ADMIN_COOKIE } from '../constants';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const auth = req.headers.authorization;
    const bearer = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    const cookieTok =
      typeof req.cookies?.[ADMIN_COOKIE] === 'string' ? req.cookies[ADMIN_COOKIE] : '';
    const token = bearer || cookieTok;
    if (!token) throw new UnauthorizedException();
    try {
      const p = this.jwt.verify<{ role?: string }>(token);
      if (p.role !== 'admin') throw new UnauthorizedException();
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
