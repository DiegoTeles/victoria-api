import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CurriculumRepository } from '../repositories/curriculum.repository';

const LOCALES = new Set(['pt-Br', 'en', 'fr', 'it', 'de']);

@Injectable()
export class CurriculumAdminService {
  constructor(private readonly curriculumRepository: CurriculumRepository) {}

  list() {
    return this.curriculumRepository.findAllForAdmin();
  }

  async save(body: Record<string, unknown>) {
    const locale = String(body.locale || '').trim();
    if (!LOCALES.has(locale)) {
      throw new BadRequestException('Invalid locale');
    }
    const content = String(body.content ?? '');
    const isPublished = Boolean(body.isPublished);
    try {
      return await this.curriculumRepository.upsertLocale(locale, content, isPublished);
    } catch {
      throw new InternalServerErrorException('Failed to save curriculum');
    }
  }
}
