import { Controller, Get, Header, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesPublicService } from './services/categories-public.service';

@ApiTags('Público', 'Categorias')
@Controller('categories')
export class CategoriesPublicController {
  constructor(private readonly categoriesPublicService: CategoriesPublicService) {}

  @Get()
  @Header('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  @ApiOperation({ summary: 'Árvore de categorias e subcategorias (público)' })
  @ApiQuery({ name: 'locale', required: false })
  @ApiResponse({ status: 200, description: 'Árvore' })
  @ApiResponse({ status: 500, description: 'Erro interno' })
  tree(@Query('locale') locale?: string) {
    return this.categoriesPublicService.execute(locale);
  }
}
