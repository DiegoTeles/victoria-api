import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../common/guards/admin.guard';
import { CategoriesAdminService } from './services/categories-admin.service';

@ApiTags('Admin', 'Categorias')
@ApiCookieAuth('portfolio_admin')
@UseGuards(AdminGuard)
@Controller('admin/categories')
export class CategoriesAdminController {
  constructor(private readonly categoriesAdminService: CategoriesAdminService) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorias (admin)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  list() {
    return this.categoriesAdminService.listCategories();
  }

  @Post()
  @ApiOperation({ summary: 'Criar categoria' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 409 })
  create(@Body() body: Record<string, unknown>) {
    return this.categoriesAdminService.createCategory(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar categoria' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.categoriesAdminService.updateCategory(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar categoria' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  remove(@Param('id') id: string) {
    return this.categoriesAdminService.deleteCategory(id);
  }
}
