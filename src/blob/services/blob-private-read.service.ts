import { createReadStream, existsSync } from 'node:fs';
import { extname } from 'node:path';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { LocalMediaService } from './local-media.service';

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

@Injectable()
export class BlobPrivateReadService {
  constructor(private readonly localMedia: LocalMediaService) {}

  async streamToResponse(urlRaw: string | undefined, res: Response) {
    const blobUrl = typeof urlRaw === 'string' ? urlRaw.trim() : '';
    if (!blobUrl) {
      throw new BadRequestException('Missing url');
    }
    let pathname: string;
    try {
      const parsed = new URL(blobUrl);
      pathname = parsed.pathname;
    } catch {
      throw new BadRequestException('Invalid url');
    }
    const prefix = '/api/media/';
    if (!pathname.includes(prefix)) {
      throw new BadRequestException('Invalid media url');
    }
    const idx = pathname.indexOf(prefix);
    const name = pathname.slice(idx + prefix.length).split('/')[0];
    if (!name) {
      throw new BadRequestException('Invalid media url');
    }
    const abs = this.localMedia.pathForStoredName(name);
    if (!existsSync(abs)) {
      throw new NotFoundException('Not found');
    }
    const ext = extname(name).toLowerCase();
    const ct = MIME[ext] ?? 'application/octet-stream';
    res.status(200);
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    const stream = createReadStream(abs);
    stream.pipe(res);
  }
}
