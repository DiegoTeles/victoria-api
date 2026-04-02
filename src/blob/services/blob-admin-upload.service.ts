import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Express } from 'express';
import { LocalMediaService } from './local-media.service';

@Injectable()
export class BlobAdminUploadService {
  constructor(
    private readonly localMedia: LocalMediaService,
    private readonly config: ConfigService,
  ) {}

  async execute(file: Express.Multer.File | undefined) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Missing file');
    }
    if (!this.localMedia.isAllowedMediaMime(file.mimetype)) {
      throw new BadRequestException('Only image and video uploads are allowed');
    }
    const name = this.localMedia.safeStoredName(file.originalname, file.mimetype);
    if (!/^[0-9a-f-]{36}\.[a-z0-9]{1,12}$/i.test(name)) {
      throw new BadRequestException('Invalid file name');
    }
    const dest = join(this.localMedia.getAbsoluteDir(), name);
    await writeFile(dest, file.buffer);
    const path = `/api/media/${name}`;
    const base = (this.config.get<string>('publicOrigin') ?? '').replace(/\/$/, '');
    return { url: base ? `${base}${path}` : path };
  }
}
