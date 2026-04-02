import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';
import { CategoriesRepository } from '../repositories/categories.repository';

@Injectable()
export class CategoriesAdminService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  listCategories() {
    return this.categoriesRepository.listCategoriesAdmin();
  }

  async createCategory(body: Record<string, unknown>) {
    try {
      return await this.categoriesRepository.createCategory(body);
    } catch (e) {
      if (e instanceof UniqueConstraintError) {
        throw new ConflictException('Slug already exists');
      }
      if (e instanceof Error && e.message === 'slug required') {
        throw new BadRequestException('slug is required');
      }
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  async updateCategory(id: string, body: Record<string, unknown>) {
    try {
      const r = await this.categoriesRepository.updateCategory(id, body);
      if (!r) throw new NotFoundException('Not found');
      return r;
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      if (e instanceof UniqueConstraintError) {
        throw new ConflictException('Slug already exists');
      }
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  async deleteCategory(id: string) {
    const ok = await this.categoriesRepository.deleteCategory(id);
    if (!ok) throw new NotFoundException('Not found');
    return { ok: true };
  }

  listSubcategories(categoryId?: string) {
    if (!categoryId) return this.categoriesRepository.listSubcategoriesAllAdmin();
    return this.categoriesRepository.listSubcategoriesForCategory(categoryId);
  }

  async createSubcategory(body: Record<string, unknown>) {
    try {
      return await this.categoriesRepository.createSubcategory(body);
    } catch (e) {
      if (e instanceof UniqueConstraintError) {
        throw new ConflictException('Slug already exists in this category');
      }
      if (e instanceof Error && e.message === 'categoryId and slug required') {
        throw new BadRequestException('categoryId and slug are required');
      }
      throw new InternalServerErrorException('Failed to create subcategory');
    }
  }

  async updateSubcategory(id: string, body: Record<string, unknown>) {
    try {
      const r = await this.categoriesRepository.updateSubcategory(id, body);
      if (!r) throw new NotFoundException('Not found');
      return r;
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      if (e instanceof UniqueConstraintError) {
        throw new ConflictException('Slug already exists in this category');
      }
      throw new InternalServerErrorException('Failed to update subcategory');
    }
  }

  async deleteSubcategory(id: string) {
    const ok = await this.categoriesRepository.deleteSubcategory(id);
    if (!ok) throw new NotFoundException('Not found');
    return { ok: true };
  }
}
