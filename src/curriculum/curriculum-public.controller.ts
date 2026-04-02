import { Controller, Get, Header, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurriculumPublicService } from './services/curriculum-public.service';

@ApiTags('Público', 'Currículo')
@Controller('about')
export class CurriculumPublicController {
  constructor(private readonly curriculumPublicService: CurriculumPublicService) {}

  @Get('curriculum')
  @Header('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  @ApiOperation({ summary: 'Currículo público por locale' })
  @ApiQuery({ name: 'locale', required: false })
  @ApiResponse({ status: 200 })
  curriculum(@Query('locale') locale?: string) {
    return this.curriculumPublicService.execute(locale);
  }
}
