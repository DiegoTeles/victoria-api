import { Controller, Get, Header, NotFoundException, Param, Res } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { createReadStream, existsSync } from 'node:fs';
import { extname } from 'node:path';
import type { Response } from 'express';
import { LocalMediaService } from './services/local-media.service';

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

@ApiTags('Público', 'Media')
@Controller('media')
export class MediaPublicController {
  constructor(private readonly localMedia: LocalMediaService) {}

  @Get(':name')
  @Header('Cache-Control', 'public, max-age=86400')
  @ApiOperation({ summary: 'Ficheiro de mídia público' })
  @ApiParam({ name: 'name' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  serve(@Param('name') name: string, @Res() res: Response) {
    const abs = this.localMedia.pathForStoredName(name);
    if (!existsSync(abs)) {
      throw new NotFoundException('Not found');
    }
    const ext = extname(name).toLowerCase();
    const ct = MIME[ext] ?? 'application/octet-stream';
    res.setHeader('Content-Type', ct);
    createReadStream(abs).pipe(res);
  }
}
