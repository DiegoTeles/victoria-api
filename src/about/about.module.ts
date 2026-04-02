import { Module } from '@nestjs/common';
import { BioRepository } from './repositories/bio.repository';
import { BioPublicService } from './services/bio-public.service';
import { BioAdminService } from './services/bio-admin.service';
import { BioPublicController } from './bio-public.controller';
import { BioAdminController } from './bio-admin.controller';
@Module({
  controllers: [BioPublicController, BioAdminController],
  providers: [BioRepository, BioPublicService, BioAdminService],
})
export class AboutModule {}
