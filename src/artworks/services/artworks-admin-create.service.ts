import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { UniqueConstraintError } from 'sequelize';
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
      if (e instanceof UniqueConstraintError) {
        throw new ConflictException('Artwork id already exists');
      }
      throw e instanceof BadRequestException
        ? e
        : new InternalServerErrorException('Failed to create artwork');
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
