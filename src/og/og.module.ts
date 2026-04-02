import { Module } from '@nestjs/common';
import { ArtworksModule } from '../artworks/artworks.module';
import { OgPageController } from './og-page.controller';
import { OgPageService } from './og-page.service';

@Module({
  imports: [ArtworksModule],
  controllers: [OgPageController],
  providers: [OgPageService],
})
export class OgModule {}
