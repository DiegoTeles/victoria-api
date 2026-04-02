import { Module } from '@nestjs/common';
import { BlobAdminUploadService } from './services/blob-admin-upload.service';
import { BlobPrivateReadService } from './services/blob-private-read.service';
import { LocalMediaService } from './services/local-media.service';
import { BlobAdminController } from './blob-admin.controller';
import { BlobPrivateController } from './blob-private.controller';
import { MediaPublicController } from './media-public.controller';

@Module({
  controllers: [BlobAdminController, BlobPrivateController, MediaPublicController],
  providers: [LocalMediaService, BlobAdminUploadService, BlobPrivateReadService],
  exports: [LocalMediaService],
})
export class BlobModule {}
