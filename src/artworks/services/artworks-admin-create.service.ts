import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';
import { ArtworksRepository } from '../repositories/artworks.repository';
import { ArtworkCategoriesRepository } from '../repositories/artwork-categories.repository';
import { bodyToInsertPayload, rowToArtwork, type ArtworkRow } from '../artwork.mapper';

@Injectable()
export class ArtworksAdminCreateService {
  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    private readonly artworksRepository: ArtworksRepository,
    private readonly artworkCategoriesRepository: ArtworkCategoriesRepository,
  ) {}

  async execute(body: Record<string, unknown>) {
    const p = bodyToInsertPayload(body);
    if (!p.id || !p.artwork_date) {
      throw new BadRequestException('id and date are required');
    }
    if (!p.title) {
      throw new BadRequestException('title is required');
    }
    const payload = {
      ...p,
      description: p.description as object,
      caption_medium: p.caption_medium as object,
      physical_dimensions: p.physical_dimensions as object,
      types: p.types as unknown[],
      info: p.info,
      resolution: p.resolution,
      extra_descriptions: p.extra_descriptions,
      extra_titles: p.extra_titles,
      extra_caption_media: p.extra_caption_media,
      extra_physical_dimensions: p.extra_physical_dimensions,
      extra_resolutions: p.extra_resolutions,
      extra_media_bytes: p.extra_media_bytes,
    };
    const needsCat = body.categoryAssignments !== undefined || body.categories !== undefined;
    try {
      await this.sequelize.transaction(async (t) => {
        await this.artworksRepository.create(payload, { transaction: t });
        if (needsCat) {
          await this.artworkCategoriesRepository.replaceForArtwork(p.id, body, t);
        }
      });
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e;
      }
      if (e instanceof ForeignKeyConstraintError) {
        throw new BadRequestException(
          'Categoria, subcategoria ou referência inválida. Confirma que as categorias existem na base de dados.',
        );
      }
      if (e instanceof UniqueConstraintError) {
        const parentMsg =
          e.parent && typeof e.parent === 'object' && 'message' in e.parent
            ? String((e.parent as { message?: string }).message ?? '')
            : '';
        const hint = `${e.message} ${parentMsg}`;
        if (/artwork_categories|idx_artwork_categories/i.test(hint)) {
          throw new BadRequestException(
            'Combinação de categoria/subcategoria duplicada para esta obra.',
          );
        }
        throw new ConflictException('Já existe uma obra com este id.');
      }
      throw e;
    }
    const row = await this.artworksRepository.findById(p.id);
    if (!row) throw new InternalServerErrorException('Failed to create artwork');
    let cats: { categoryId: string; subcategoryId: string | null }[] = [];
    try {
      cats = await this.artworkCategoriesRepository.loadForArtworkId(p.id);
    } catch {
      cats = [];
    }
    return rowToArtwork(row.get({ plain: true }) as ArtworkRow, cats);
  }
}
