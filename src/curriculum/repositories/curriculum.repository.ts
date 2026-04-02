import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CurriculumEntry } from '../../database/models/curriculum-entry.model';

const LOCALES = ['pt-Br', 'en', 'fr', 'it', 'de'] as const;

@Injectable()
export class CurriculumRepository {
  constructor(@InjectModel(CurriculumEntry) private readonly model: typeof CurriculumEntry) {}

  async findPublishedByLocale(locale: string) {
    const row = await this.model.findOne({ where: { locale } });
    if (!row || !row.is_published) {
      return { content: '', isPublished: false };
    }
    return { content: row.content ?? '', isPublished: true };
  }

  async findAllForAdmin() {
    const rows = await this.model.findAll({ order: [['locale', 'ASC']] });
    const byLocale = new Map(rows.map((r) => [r.locale, r]));
    return {
      entries: LOCALES.map((locale) => {
        const r = byLocale.get(locale);
        return {
          locale,
          content: r?.content ?? '',
          isPublished: r?.is_published ?? false,
          updatedAt: r?.updatedAt ?? null,
        };
      }),
    };
  }

  async upsertLocale(locale: string, content: string, isPublished: boolean) {
    await this.model.upsert({
      locale,
      content,
      is_published: isPublished,
    } as any);
    const r = await this.model.findOne({ where: { locale } });
    if (!r) throw new Error('upsert failed');
    return {
      locale: r.locale,
      content: r.content,
      isPublished: r.is_published,
      updatedAt: r.updatedAt,
    };
  }
}
