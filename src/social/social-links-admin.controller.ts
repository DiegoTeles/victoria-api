import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../common/guards/admin.guard';
import { SocialLinksAdminService } from './services/social-links-admin.service';

@ApiTags('Admin', 'Redes')
@ApiCookieAuth('portfolio_admin')
@UseGuards(AdminGuard)
@Controller('admin/social-links')
export class SocialLinksAdminController {
  constructor(private readonly socialLinksAdminService: SocialLinksAdminService) {}

  @Get()
  @ApiOperation({ summary: 'Listar links (admin)' })
  @ApiResponse({ status: 200 })
  list() {
    return this.socialLinksAdminService.list();
  }

  @Post()
  @ApiOperation({ summary: 'Criar link' })
  @ApiResponse({ status: 201 })
  create(@Body() body: Record<string, unknown>) {
    return this.socialLinksAdminService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar link' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.socialLinksAdminService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar link' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  remove(@Param('id') id: string) {
    return this.socialLinksAdminService.remove(id);
  }
}
