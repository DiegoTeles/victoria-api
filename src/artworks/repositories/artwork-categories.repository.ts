import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, type Transaction } from 'sequelize';
import { ArtworkCategory } from '../../database/models/artwork-category.model';
import { Subcategory } from '../../database/models/subcategory.model';
import type { CategoryAssignment } from '../artwork.mapper';

export const ArtworkCategoriesRepositoryOps = {
  loadMapForArtworkIds: 'loadMapForArtworkIds',
  loadForArtworkId: 'loadForArtworkId',
  replaceForArtwork: 'replaceForArtwork',
} as const;

function normalizeAssignments(body: Record<string, unknown>): CategoryAssignment[] {
  const raw = body.categoryAssignments ?? body.categories;
  if (!Array.isArray(raw)) return [];
  const out: CategoryAssignment[] = [];
  for (const x of raw) {
    if (!x || typeof x !== 'object') continue;
    const o = x as Record<string, unknown>;
    const categoryId = String(o.categoryId ?? o.category_id ?? '').trim();
    if (!categoryId) continue;
    const subRaw = o.subcategoryId ?? o.subcategory_id;
    const subcategoryId =
      subRaw === null || subRaw === undefined || subRaw === '' ? null : String(subRaw).trim();
    out.push({ categoryId, subcategoryId });
  }
  const seen = new Set<string>();
  return out.filter((a) => {
    const key = `${a.categoryId}|${a.subcategoryId ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

@Injectable()
export class ArtworkCategoriesRepository {
  constructor(
    @InjectModel(ArtworkCategory)
    private readonly acModel: typeof ArtworkCategory,
    @InjectModel(Subcategory)
    private readonly subModel: typeof Subcategory,
  ) {}

  async loadMapForArtworkIds(artworkIds: string[]): Promise<Map<string, CategoryAssignment[]>> {
    const map = new Map<string, CategoryAssignment[]>();
    if (!artworkIds.length) return map;
    const rows = await this.acModel.findAll({
      where: { artwork_id: { [Op.in]: artworkIds } },
    });
    for (const row of rows) {
      const id = row.artwork_id;
      const list = map.get(id) ?? [];
      list.push({
        categoryId: String(row.category_id),
        subcategoryId: row.subcategory_id == null ? null : String(row.subcategory_id),
      });
      map.set(id, list);
    }
    return map;
  }

  async loadForArtworkId(artworkId: string): Promise<CategoryAssignment[]> {
    const m = await this.loadMapForArtworkIds([artworkId]);
    return m.get(artworkId) ?? [];
  }

  async replaceForArtwork(
    artworkId: string,
    body: Record<string, unknown>,
    transaction?: Transaction,
  ): Promise<void> {
    const assignments = normalizeAssignments(body);
    await this.acModel.destroy({ where: { artwork_id: artworkId }, transaction });
    for (const a of assignments) {
      if (a.subcategoryId) {
        const sub = await this.subModel.findByPk(a.subcategoryId, { transaction });
        if (!sub || String(sub.category_id) !== a.categoryId) {
          throw new BadRequestException('Subcategoria inválida para a categoria');
        }
        await this.acModel.create(
          {
            artwork_id: artworkId,
            category_id: a.categoryId,
            subcategory_id: a.subcategoryId,
          } as any,
          { transaction },
        );
      } else {
        await this.acModel.create(
          {
            artwork_id: artworkId,
            category_id: a.categoryId,
            subcategory_id: null,
          } as any,
          { transaction },
        );
      }
    }
  }
}
