import { Controller, Get, Header, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ArtworksPublicListService } from './services/artworks-public-list.service';
import { ArtworksPublicDetailService } from './services/artworks-public-detail.service';

@ApiTags('Público', 'Obras')
@Controller('artworks')
export class ArtworksPublicController {
  constructor(
    private readonly listService: ArtworksPublicListService,
    private readonly detailService: ArtworksPublicDetailService,
  ) {}

  @Get()
  @Header('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  @ApiOperation({ summary: 'Listar obras (público)' })
  @ApiResponse({ status: 200, description: 'Lista de obras' })
  @ApiResponse({ status: 500, description: 'Erro interno' })
  list() {
    return this.listService.execute();
  }

  @Get(':id')
  @Header('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  @ApiOperation({ summary: 'Detalhe de obra (público)' })
  @ApiParam({ name: 'id', description: 'ID da obra' })
  @ApiResponse({ status: 200, description: 'Obra' })
  @ApiResponse({ status: 400, description: 'ID em falta' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno' })
  detail(@Param('id') id: string) {
    return this.detailService.execute(id);
  }
}
