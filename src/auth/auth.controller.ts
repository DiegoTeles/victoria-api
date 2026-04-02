import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Admin', 'Auth')
@Controller('admin')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login admin (define cookie HttpOnly)' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 401, description: 'Password inválida' })
  @ApiResponse({ status: 405, description: 'Método não permitido' })
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.auth.login(dto.password, res);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout (limpa cookie)' })
  @ApiResponse({ status: 200, description: 'OK' })
  logout(@Res({ passthrough: true }) res: Response) {
    this.auth.clearAuthCookie(res);
    return { ok: true };
  }

  @Get('me')
  @ApiCookieAuth('portfolio_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sessão admin atual' })
  @ApiResponse({ status: 200, description: 'Autenticado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  me(@Req() req: Request) {
    const token = this.auth.extractToken(req);
    if (!this.auth.verifyToken(token)) {
      return { ok: false as const };
    }
    return { ok: true as const };
  }
}
