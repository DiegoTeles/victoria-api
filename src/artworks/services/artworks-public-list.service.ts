import { Injectable } from '@nestjs/common';
import { ArtworksRepository } from '../repositories/artworks.repository';
import { ArtworkCategoriesRepository } from '../repositories/artwork-categories.repository';
import { rowToArtwork, type ArtworkRow } from '../artwork.mapper';

@Injectable()
export class ArtworksPublicListService {
  constructor(
    private readonly artworksRepository: ArtworksRepository,
    private readonly artworkCategoriesRepository: ArtworkCategoriesRepository,
  ) {}

  async execute() {
    const rows = await this.artworksRepository.findAllOrdered();
    const ids = rows.map((r) => r.id);
    let catMap: Map<string, { categoryId: string; subcategoryId: string | null }[]>;
    try {
      catMap = await this.artworkCategoriesRepository.loadMapForArtworkIds(ids);
    } catch {
      catMap = new Map();
    }
    return rows.map((row) =>
      rowToArtwork(row.get({ plain: true }) as ArtworkRow, catMap.get(row.id) ?? []),
    );
  }
}
