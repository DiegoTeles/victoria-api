import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../common/guards/admin.guard';
import { CategoriesAdminService } from './services/categories-admin.service';

@ApiTags('Admin', 'Subcategorias')
@ApiCookieAuth('portfolio_admin')
@UseGuards(AdminGuard)
@Controller('admin/subcategories')
export class SubcategoriesAdminController {
  constructor(private readonly categoriesAdminService: CategoriesAdminService) {}

  @Get()
  @ApiOperation({ summary: 'Listar subcategorias (admin)' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  list(@Query('categoryId') categoryId?: string) {
    return this.categoriesAdminService.listSubcategories(categoryId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar subcategoria' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 409 })
  create(@Body() body: Record<string, unknown>) {
    return this.categoriesAdminService.createSubcategory(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar subcategoria' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.categoriesAdminService.updateSubcategory(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar subcategoria' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  remove(@Param('id') id: string) {
    return this.categoriesAdminService.deleteSubcategory(id);
  }
}
