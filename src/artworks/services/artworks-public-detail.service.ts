import { Injectable, NotFoundException } from '@nestjs/common';
import { ArtworksRepository } from '../repositories/artworks.repository';
import { ArtworkCategoriesRepository } from '../repositories/artwork-categories.repository';
import { rowToArtwork, type ArtworkRow } from '../artwork.mapper';

@Injectable()
export class ArtworksPublicDetailService {
  constructor(
    private readonly artworksRepository: ArtworksRepository,
    private readonly artworkCategoriesRepository: ArtworkCategoriesRepository,
  ) {}

  async execute(id: string) {
    const row = await this.artworksRepository.findById(id);
    if (!row) throw new NotFoundException('Not found');
    let cats: { categoryId: string; subcategoryId: string | null }[] = [];
    try {
      cats = await this.artworkCategoriesRepository.loadForArtworkId(id);
    } catch {
      cats = [];
    }
    return rowToArtwork(row.get({ plain: true }) as ArtworkRow, cats);
  }
}
