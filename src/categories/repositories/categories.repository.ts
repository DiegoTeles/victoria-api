import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Op, QueryTypes, Sequelize } from 'sequelize';
import { Category } from '../../database/models/category.model';
import { CategoryTranslation } from '../../database/models/category-translation.model';
import { Subcategory } from '../../database/models/subcategory.model';
import { SubcategoryTranslation } from '../../database/models/subcategory-translation.model';

const LOCALES = ['pt-Br', 'en', 'fr', 'it', 'de'] as const;

function slugify(raw: string): string {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeTranslations(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  const map = new Map<string, string>();
  for (const t of raw) {
    if (!t || typeof t !== 'object') continue;
    const o = t as Record<string, unknown>;
    const loc = String(o.locale || '').trim();
    if (!LOCALES.includes(loc as (typeof LOCALES)[number])) continue;
    map.set(loc, String(o.name ?? '').trim());
  }
  return LOCALES.map((locale) => ({ locale, name: map.get(locale) ?? '' }));
}

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    @InjectModel(Category) private readonly categoryModel: typeof Category,
    @InjectModel(CategoryTranslation) private readonly catTransModel: typeof CategoryTranslation,
    @InjectModel(Subcategory) private readonly subModel: typeof Subcategory,
    @InjectModel(SubcategoryTranslation)
    private readonly subTransModel: typeof SubcategoryTranslation,
  ) {}

  async getPublicTree(locale: string) {
    const cats = await this.sequelize.query<{
      id: string;
      slug: string;
      sort_order: number;
      name: string;
    }>(
      `SELECT c.id, c.slug, c.sort_order,
              COALESCE(ct.name, c.slug) AS name
       FROM categories c
       LEFT JOIN category_translations ct
         ON ct.category_id = c.id AND ct.locale = :locale
       WHERE c.is_active = true
       ORDER BY c.sort_order ASC, c.slug ASC`,
      { replacements: { locale }, type: QueryTypes.SELECT },
    );
    const subs = await this.sequelize.query<{
      id: string;
      category_id: string;
      slug: string;
      sort_order: number;
      name: string;
    }>(
      `SELECT s.id, s.category_id, s.slug, s.sort_order,
              COALESCE(st.name, s.slug) AS name
       FROM subcategories s
       LEFT JOIN subcategory_translations st
         ON st.subcategory_id = s.id AND st.locale = :locale
       WHERE s.is_active = true
       ORDER BY s.sort_order ASC, s.slug ASC`,
      { replacements: { locale }, type: QueryTypes.SELECT },
    );
    return cats.map((c) => ({
      id: String(c.id),
      slug: c.slug,
      name: c.name,
      sortOrder: c.sort_order,
      subcategories: subs
        .filter((s) => String(s.category_id) === String(c.id))
        .map((s) => ({
          id: String(s.id),
          slug: s.slug,
          name: s.name,
          sortOrder: s.sort_order,
        })),
    }));
  }

  async listCategoriesAdmin() {
    const cats = await this.categoryModel.findAll({
      order: [
        ['sort_order', 'ASC'],
        ['slug', 'ASC'],
      ],
    });
    const trans = await this.catTransModel.findAll();
    const byCat = new Map<string, { locale: string; name: string }[]>();
    for (const t of trans) {
      const k = String(t.category_id);
      const list = byCat.get(k) ?? [];
      list.push({ locale: t.locale, name: t.name });
      byCat.set(k, list);
    }
    return cats.map((c) => {
      const plain = c.get({ plain: true }) as {
        id: string;
        slug: string;
        sort_order: number;
        is_active: boolean;
      };
      return {
        id: String(plain.id),
        slug: plain.slug,
        sortOrder: plain.sort_order,
        isActive: plain.is_active,
        translations: byCat.get(String(plain.id)) ?? [],
      };
    });
  }

  async createCategory(body: Record<string, unknown>) {
    const slug = slugify(String(body.slug || ''));
    if (!slug) throw new Error('slug required');
    const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
    const isActive = body.isActive !== false;
    const translations = normalizeTranslations(body.translations);
    const c = await this.categoryModel.create({
      slug,
      sort_order: sortOrder,
      is_active: isActive,
    } as any);
    const cid = String(c.id);
    for (const t of translations) {
      await this.catTransModel.upsert({
        category_id: cid,
        locale: t.locale,
        name: t.name || slug,
      } as any);
    }
    return {
      id: cid,
      slug: c.slug,
      sortOrder: c.sort_order,
      isActive: c.is_active,
      translations,
    };
  }

  async updateCategory(id: string, body: Record<string, unknown>) {
    let slug = slugify(String(body.slug || ''));
    const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
    const isActive = body.isActive !== false;
    const translations = normalizeTranslations(body.translations);
    const existing = await this.categoryModel.findByPk(id);
    if (!existing) return null;
    if (!slug) slug = existing.slug;
    await existing.update({
      slug,
      sort_order: sortOrder,
      is_active: isActive,
    });
    for (const t of translations) {
      await this.catTransModel.upsert({
        category_id: id,
        locale: t.locale,
        name: t.name || slug,
      } as any);
    }
    const c = await this.categoryModel.findByPk(id);
    if (!c) return null;
    return {
      id: String(c.id),
      slug: c.slug,
      sortOrder: c.sort_order,
      isActive: c.is_active,
      translations,
    };
  }

  async deleteCategory(id: string): Promise<boolean> {
    const n = await this.categoryModel.destroy({ where: { id } });
    return n > 0;
  }

  async listSubcategoriesAllAdmin() {
    const subs = await this.sequelize.query<{
      id: string;
      category_id: string;
      slug: string;
      sort_order: number;
      is_active: boolean;
      category_slug: string;
      category_name_pt: string;
    }>(
      `SELECT s.id, s.category_id, s.slug, s.sort_order, s.is_active,
              c.slug AS category_slug,
              COALESCE(ct.name, c.slug) AS category_name_pt
       FROM subcategories s
       INNER JOIN categories c ON c.id = s.category_id
       LEFT JOIN category_translations ct
         ON ct.category_id = c.id AND ct.locale = 'pt-Br'
       ORDER BY c.sort_order ASC, c.slug ASC, s.sort_order ASC, s.slug ASC`,
      { type: QueryTypes.SELECT },
    );
    const ids = subs.map((s) => s.id);
    const trans =
      ids.length === 0
        ? []
        : await this.subTransModel.findAll({
            where: { subcategory_id: { [Op.in]: ids } },
          });
    const bySub = new Map<string, { locale: string; name: string }[]>();
    for (const t of trans) {
      const k = String(t.subcategory_id);
      const list = bySub.get(k) ?? [];
      list.push({ locale: t.locale, name: t.name });
      bySub.set(k, list);
    }
    return subs.map((s) => ({
      id: String(s.id),
      categoryId: String(s.category_id),
      categorySlug: s.category_slug,
      categoryNamePt: s.category_name_pt,
      slug: s.slug,
      sortOrder: s.sort_order,
      isActive: s.is_active,
      translations: bySub.get(String(s.id)) ?? [],
    }));
  }

  async listSubcategoriesForCategory(categoryId: string) {
    const subs = await this.subModel.findAll({
      where: { category_id: categoryId },
      order: [
        ['sort_order', 'ASC'],
        ['slug', 'ASC'],
      ],
    });
    const ids = subs.map((s) => s.id);
    const trans =
      ids.length === 0
        ? []
        : await this.subTransModel.findAll({
            where: { subcategory_id: { [Op.in]: ids } },
          });
    const bySub = new Map<string, { locale: string; name: string }[]>();
    for (const t of trans) {
      const k = String(t.subcategory_id);
      const list = bySub.get(k) ?? [];
      list.push({ locale: t.locale, name: t.name });
      bySub.set(k, list);
    }
    return subs.map((s) => {
      const plain = s.get({ plain: true }) as {
        id: string;
        category_id: string;
        slug: string;
        sort_order: number;
        is_active: boolean;
      };
      return {
        id: String(plain.id),
        categoryId: String(plain.category_id),
        slug: plain.slug,
        sortOrder: plain.sort_order,
        isActive: plain.is_active,
        translations: bySub.get(String(plain.id)) ?? [],
      };
    });
  }

  async createSubcategory(body: Record<string, unknown>) {
    const categoryId = String(body.categoryId || '').trim();
    let slug = slugify(String(body.slug || ''));
    if (!categoryId || !slug) throw new Error('categoryId and slug required');
    const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
    const isActive = body.isActive !== false;
    const translations = normalizeTranslations(body.translations);
    const s = await this.subModel.create({
      category_id: categoryId,
      slug,
      sort_order: sortOrder,
      is_active: isActive,
    } as any);
    const sid = String(s.id);
    for (const t of translations) {
      await this.subTransModel.upsert({
        subcategory_id: sid,
        locale: t.locale,
        name: t.name || slug,
      } as any);
    }
    return {
      id: sid,
      categoryId: String(s.category_id),
      slug: s.slug,
      sortOrder: s.sort_order,
      isActive: s.is_active,
      translations,
    };
  }

  async updateSubcategory(id: string, body: Record<string, unknown>) {
    let slug = slugify(String(body.slug || ''));
    const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
    const isActive = body.isActive !== false;
    const translations = normalizeTranslations(body.translations);
    const nextCategoryId =
      body.categoryId != null && body.categoryId !== ''
        ? String(body.categoryId).trim()
        : null;
    const existing = await this.subModel.findByPk(id);
    if (!existing) return null;
    if (!slug) slug = existing.slug;
    const categoryIdForRow = nextCategoryId || String(existing.category_id);
    await existing.update({
      category_id: categoryIdForRow,
      slug,
      sort_order: sortOrder,
      is_active: isActive,
    });
    for (const t of translations) {
      await this.subTransModel.upsert({
        subcategory_id: id,
        locale: t.locale,
        name: t.name || slug,
      } as any);
    }
    const s = await this.subModel.findByPk(id);
    if (!s) return null;
    return {
      id: String(s.id),
      categoryId: String(s.category_id),
      slug: s.slug,
      sortOrder: s.sort_order,
      isActive: s.is_active,
      translations,
    };
  }

  async deleteSubcategory(id: string): Promise<boolean> {
    const n = await this.subModel.destroy({ where: { id } });
    return n > 0;
  }
}
