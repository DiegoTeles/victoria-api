import { Controller, Get, Header, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BioPublicService } from './services/bio-public.service';

@ApiTags('Público', 'Sobre')
@Controller('about')
export class BioPublicController {
  constructor(private readonly bioPublicService: BioPublicService) {}

  @Get('bio')
  @Header('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  @ApiOperation({ summary: 'Bio pública por locale' })
  @ApiQuery({ name: 'locale', required: false })
  @ApiResponse({ status: 200 })
  bio(@Query('locale') locale?: string) {
    return this.bioPublicService.execute(locale);
  }
}
