import { Module } from '@nestjs/common';
import { SocialLinksRepository } from './repositories/social-links.repository';
import { SocialLinksPublicService } from './services/social-links-public.service';
import { SocialLinksAdminService } from './services/social-links-admin.service';
import { SocialLinksPublicController } from './social-links-public.controller';
import { SocialLinksAdminController } from './social-links-admin.controller';
@Module({
  controllers: [SocialLinksPublicController, SocialLinksAdminController],
  providers: [SocialLinksRepository, SocialLinksPublicService, SocialLinksAdminService],
})
export class SocialModule {}
