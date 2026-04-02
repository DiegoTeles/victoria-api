import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurriculumAdminService } from './services/curriculum-admin.service';

@ApiTags('Admin', 'Currículo')
@ApiCookieAuth('portfolio_admin')
@UseGuards(AdminGuard)
@Controller('admin/curriculum')
export class CurriculumAdminController {
  constructor(private readonly curriculumAdminService: CurriculumAdminService) {}

  @Get()
  @ApiOperation({ summary: 'Listar currículo (admin)' })
  @ApiResponse({ status: 200 })
  list() {
    return this.curriculumAdminService.list();
  }

  @Put()
  @ApiOperation({ summary: 'Guardar currículo por locale' })
  @ApiResponse({ status: 200 })
  save(@Body() body: Record<string, unknown>) {
    return this.curriculumAdminService.save(body);
  }
}
