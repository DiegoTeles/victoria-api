import { Controller, Get, Header, Query, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { OgPageService } from './og-page.service';

@ApiTags('Público', 'OG')
@Controller('og-page')
export class OgPageController {
  constructor(
    private readonly og: OgPageService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'HTML com meta tags Open Graph (partilha social)' })
  @ApiQuery({ name: 'image', required: false })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 307 })
  async page(
    @Query('image') image: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const html = await this.og.buildHtml(image, req);
    if (!html) {
      const pub = (this.config.get<string>('publicOrigin') ?? '').replace(/\/$/, '');
      const fe = (this.config.get<string>('frontendOrigin') ?? '').replace(/\/$/, '');
      const loc = pub || fe || '/';
      res.redirect(307, loc.endsWith('/') ? loc : `${loc}/`);
      return;
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Vary', 'Accept');
    res.status(200).send(html);
  }
}
