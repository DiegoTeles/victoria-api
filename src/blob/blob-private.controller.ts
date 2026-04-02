import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { BlobPrivateReadService } from './services/blob-private-read.service';

@ApiTags('Público', 'Blob')
@Controller('blob')
export class BlobPrivateController {
  constructor(private readonly blobPrivateReadService: BlobPrivateReadService) {}

  @Get('private')
  @ApiOperation({ summary: 'Proxy de URL absoluta para ficheiro em /api/media/' })
  @ApiQuery({ name: 'url', required: true })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  async privateBlob(@Query('url') url: string, @Res() res: Response) {
    await this.blobPrivateReadService.streamToResponse(url, res);
  }
}
