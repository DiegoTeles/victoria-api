import { Module } from '@nestjs/common';
import { CurriculumRepository } from './repositories/curriculum.repository';
import { CurriculumPublicService } from './services/curriculum-public.service';
import { CurriculumAdminService } from './services/curriculum-admin.service';
import { CurriculumPublicController } from './curriculum-public.controller';
import { CurriculumAdminController } from './curriculum-admin.controller';
@Module({
  controllers: [CurriculumPublicController, CurriculumAdminController],
  providers: [CurriculumRepository, CurriculumPublicService, CurriculumAdminService],
})
export class CurriculumModule {}
