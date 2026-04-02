import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  type LoggerService,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { RecordNotFoundError } from '../../database/models/base.model';
import {
  ConnectionError,
  DatabaseError,
  ForeignKeyConstraintError,
  UniqueConstraintError,
  ValidationError,
} from 'sequelize';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const isProd = this.config.get<string>('nodeEnv') === 'production';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code: string | undefined;
    let detail: string | undefined;
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (body && typeof body === 'object' && 'message' in body) {
        const m = (body as { message: string | string[] }).message;
        message = Array.isArray(m) ? m.join(', ') : String(m);
      } else {
        message = exception.message;
      }
    } else if (exception instanceof ConnectionError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      code = 'DatabaseConnectionError';
      message = 'Base de dados indisponível ou host inválido';
      detail = exception.message;
    } else if (exception instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'ValidationError';
      message = exception.errors.map((e) => e.message).join('; ') || exception.message;
    } else if (exception instanceof UniqueConstraintError) {
      status = HttpStatus.CONFLICT;
      code = 'UniqueConstraintError';
      message = 'Registo duplicado';
      detail = exception.message;
    } else if (exception instanceof ForeignKeyConstraintError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'ForeignKeyConstraintError';
      message = 'Referência inválida';
      detail = exception.message;
    } else if (exception instanceof DatabaseError) {
      const msg = exception.message;
      detail = msg;
      if (/relation .* does not exist/i.test(msg)) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        code = 'SchemaMissing';
        message =
          'Tabelas em falta na base de dados. Executa as migrações: npm run db:migrate (ou docker compose up para correr o serviço migrate).';
      } else {
        message = msg;
      }
    } else if (exception instanceof RecordNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      code = 'RecordNotFound';
      message = 'Not found';
    } else if (exception instanceof Error) {
      message = exception.message || message;
      detail = exception.message;
      stack = exception.stack;
    }

    const payload: Record<string, unknown> = {
      statusCode: status,
      message,
      path: req.url,
      timestamp: new Date().toISOString(),
    };
    if (code) payload.code = code;
    if (!isProd && detail) payload.detail = detail;
    if (!isProd && stack) payload.stack = stack;

    const logMsg = `${req.method} ${req.url} → ${status} ${message}${detail ? ` | ${detail}` : ''}`;
    if (status >= 500) {
      this.logger.error(logMsg, stack ?? (exception instanceof Error ? exception.stack : undefined));
    } else {
      this.logger.warn(logMsg);
    }

    res.status(status).json(payload);
  }
}
