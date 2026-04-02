import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../common/guards/admin.guard';
import { BioAdminService } from './services/bio-admin.service';

@ApiTags('Admin', 'Bio')
@ApiCookieAuth('portfolio_admin')
@UseGuards(AdminGuard)
@Controller('admin/bio')
export class BioAdminController {
  constructor(private readonly bioAdminService: BioAdminService) {}

  @Get()
  @ApiOperation({ summary: 'Listar entradas de bio (admin)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  list() {
    return this.bioAdminService.list();
  }

  @Put()
  @ApiOperation({ summary: 'Guardar bio por locale' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400 })
  save(@Body() body: Record<string, unknown>) {
    return this.bioAdminService.save(body);
  }
}
