import { Module } from '@nestjs/common';
import { ArtworksRepository } from './repositories/artworks.repository';
import { ArtworkCategoriesRepository } from './repositories/artwork-categories.repository';
import { ArtworksPublicListService } from './services/artworks-public-list.service';
import { ArtworksPublicDetailService } from './services/artworks-public-detail.service';
import { ArtworksAdminCreateService } from './services/artworks-admin-create.service';
import { ArtworksAdminUpdateService } from './services/artworks-admin-update.service';
import { ArtworksAdminDeleteService } from './services/artworks-admin-delete.service';
import { ArtworksPublicController } from './artworks-public.controller';
import { ArtworksAdminController } from './artworks-admin.controller';
import { BlobModule } from '../blob/blob.module';

@Module({
  imports: [BlobModule],
  controllers: [ArtworksPublicController, ArtworksAdminController],
  providers: [
    ArtworksRepository,
    ArtworkCategoriesRepository,
    ArtworksPublicListService,
    ArtworksPublicDetailService,
    ArtworksAdminCreateService,
    ArtworksAdminUpdateService,
    ArtworksAdminDeleteService,
  ],
  exports: [ArtworksRepository],
})
export class ArtworksModule {}
