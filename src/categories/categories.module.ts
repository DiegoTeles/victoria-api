import { Module } from '@nestjs/common';
import { CategoriesRepository } from './repositories/categories.repository';
import { CategoriesPublicService } from './services/categories-public.service';
import { CategoriesAdminService } from './services/categories-admin.service';
import { CategoriesPublicController } from './categories-public.controller';
import { CategoriesAdminController } from './categories-admin.controller';
import { SubcategoriesAdminController } from './subcategories-admin.controller';
@Module({
  controllers: [CategoriesPublicController, CategoriesAdminController, SubcategoriesAdminController],
  providers: [CategoriesRepository, CategoriesPublicService, CategoriesAdminService],
})
export class CategoriesModule {}
