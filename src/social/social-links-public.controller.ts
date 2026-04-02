import { Controller, Get, Header } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SocialLinksPublicService } from './services/social-links-public.service';

@ApiTags('Público', 'Redes')
@Controller('social-links')
export class SocialLinksPublicController {
  constructor(private readonly socialLinksPublicService: SocialLinksPublicService) {}

  @Get()
  @Header('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  @ApiOperation({ summary: 'Links sociais ativos' })
  @ApiResponse({ status: 200 })
  list() {
    return this.socialLinksPublicService.execute();
  }
}
