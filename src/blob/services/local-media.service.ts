import { mkdirSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const ALLOWED_MIME = /^(image|video)\//i;

@Injectable()
export class LocalMediaService implements OnModuleInit {
  private readonly absDir: string;

  constructor(private readonly config: ConfigService) {
    const dir = this.config.get<string>('uploadDir') ?? 'data/uploads';
    this.absDir = dir.startsWith('/') ? dir : join(process.cwd(), dir);
  }

  onModuleInit() {
    if (!existsSync(this.absDir)) {
      mkdirSync(this.absDir, { recursive: true });
    }
  }

  getAbsoluteDir(): string {
    return this.absDir;
  }

  isAllowedMediaMime(mime: string | undefined): boolean {
    return typeof mime === 'string' && ALLOWED_MIME.test(mime);
  }

  safeStoredName(originalName: string, mime: string | undefined): string {
    const ext = extname(originalName || '').toLowerCase();
    const allowedExt = /^\.[a-z0-9]{1,8}$/.test(ext) ? ext : this.extFromMime(mime);
    return `${randomUUID()}${allowedExt}`;
  }

  private extFromMime(mime: string | undefined): string {
    if (!mime) return '.bin';
    const m = mime.toLowerCase();
    if (m === 'image/jpeg' || m === 'image/jpg') return '.jpg';
    if (m === 'image/png') return '.png';
    if (m === 'image/webp') return '.webp';
    if (m === 'image/gif') return '.gif';
    if (m === 'image/svg+xml') return '.svg';
    if (m === 'video/mp4') return '.mp4';
    if (m === 'video/webm') return '.webm';
    return '.bin';
  }

  pathForStoredName(name: string): string {
    if (!/^[0-9a-f-]{36}\.[a-z0-9]{1,12}$/i.test(name)) {
      throw new BadRequestException('Invalid file id');
    }
    return join(this.absDir, name);
  }
}
