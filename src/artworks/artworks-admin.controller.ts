import { Body, Controller, Delete, Param, Post, Put, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from '../common/guards/admin.guard';
import { ArtworksAdminCreateService } from './services/artworks-admin-create.service';
import { ArtworksAdminUpdateService } from './services/artworks-admin-update.service';
import { ArtworksAdminDeleteService } from './services/artworks-admin-delete.service';

@ApiTags('Admin', 'Obras')
@ApiCookieAuth('portfolio_admin')
@UseGuards(AdminGuard)
@Controller('admin/artworks')
export class ArtworksAdminController {
  constructor(
    private readonly createService: ArtworksAdminCreateService,
    private readonly updateService: ArtworksAdminUpdateService,
    private readonly deleteService: ArtworksAdminDeleteService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar obra' })
  @ApiBody({ description: 'Payload da obra (espelho do admin atual)' })
  @ApiResponse({ status: 201, description: 'Criada' })
  @ApiResponse({ status: 400, description: 'Validação' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 409, description: 'ID já existe' })
  @ApiResponse({ status: 500, description: 'Erro interno' })
  create(@Body() body: Record<string, unknown>) {
    return this.createService.execute(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar obra' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Atualizada' })
  @ApiResponse({ status: 400, description: 'Validação' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno' })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.updateService.execute(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar obra' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Eliminada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiResponse({ status: 502, description: 'Falha no armazenamento blob' })
  @ApiResponse({ status: 500, description: 'Erro interno' })
  remove(@Param('id') id: string) {
    return this.deleteService.execute(id);
  }
}
