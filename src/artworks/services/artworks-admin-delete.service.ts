import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ArtworksRepository } from '../repositories/artworks.repository';
import { deleteLocalMediaFilesFromRow } from '../delete-artwork-blobs';
import { LocalMediaService } from '../../blob/services/local-media.service';

@Injectable()
export class ArtworksAdminDeleteService {
  constructor(
    private readonly artworksRepository: ArtworksRepository,
    private readonly localMedia: LocalMediaService,
  ) {}

  async execute(id: string) {
    const row = await this.artworksRepository.findBlobFieldsById(id);
    if (!row) throw new NotFoundException('Not found');
    try {
      await deleteLocalMediaFilesFromRow(row, this.localMedia.getAbsoluteDir());
    } catch {
      throw new BadGatewayException('Falha ao apagar ficheiros no armazenamento');
    }
    const ok = await this.artworksRepository.deleteById(id);
    if (!ok) throw new NotFoundException('Not found');
    return { ok: true };
  }
}
