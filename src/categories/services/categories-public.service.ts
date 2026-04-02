import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from '../repositories/categories.repository';

@Injectable()
export class CategoriesPublicService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  execute(locale?: string) {
    const loc = locale && String(locale).trim() ? String(locale).trim() : 'pt-Br';
    return this.categoriesRepository.getPublicTree(loc);
  }
}
