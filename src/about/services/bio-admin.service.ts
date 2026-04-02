import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { BioRepository } from '../repositories/bio.repository';

const LOCALES = new Set(['pt-Br', 'en', 'fr', 'it', 'de']);

@Injectable()
export class BioAdminService {
  constructor(private readonly bioRepository: BioRepository) {}

  list() {
    return this.bioRepository.findAllForAdmin();
  }

  async save(body: Record<string, unknown>) {
    const locale = String(body.locale || '').trim();
    if (!LOCALES.has(locale)) {
      throw new BadRequestException('Invalid locale');
    }
    const content = String(body.content ?? '');
    const isPublished = Boolean(body.isPublished);
    try {
      return await this.bioRepository.upsertLocale(locale, content, isPublished);
    } catch {
      throw new InternalServerErrorException('Failed to save bio');
    }
  }
}
