import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { Transaction } from 'sequelize';
import { Artwork } from '../../database/models/artwork.model';
import type {
  ArtworkBlobRow,
  ArtworkInsertPayload,
  IArtworksRepository,
} from './artworks.repository.interface';

@Injectable()
export class ArtworksRepository implements IArtworksRepository {
  constructor(
    @InjectModel(Artwork)
    private readonly artworkModel: typeof Artwork,
  ) {}

  findAllOrdered(): Promise<Artwork[]> {
    return this.artworkModel.findAll({ order: [['order_index', 'ASC']] });
  }

  findById(id: string): Promise<Artwork | null> {
    return this.artworkModel.findByPk(id);
  }

  async create(values: ArtworkInsertPayload, opts?: { transaction?: Transaction }): Promise<Artwork> {
    return this.artworkModel.create(
      {
        id: values.id,
        order_index: values.order_index,
        title: values.title,
        artwork_date: values.artwork_date,
        description: values.description,
        caption_medium: values.caption_medium,
        physical_dimensions: values.physical_dimensions,
        image_url: values.image_url,
        video_url: values.video_url,
        group_key: values.group_key,
        group_display: values.group_display,
        types: values.types,
        info: values.info,
        resolution: values.resolution,
        main_media_bytes: values.main_media_bytes,
        extra_images: values.extra_images,
        extra_descriptions: values.extra_descriptions,
        extra_titles: values.extra_titles,
        extra_caption_media: values.extra_caption_media,
        extra_physical_dimensions: values.extra_physical_dimensions,
        extra_resolutions: values.extra_resolutions,
        extra_media_bytes: values.extra_media_bytes,
      } as any,
      { transaction: opts?.transaction },
    );
  }

  async update(id: string, values: ArtworkInsertPayload, opts?: { transaction?: Transaction }): Promise<void> {
    await this.artworkModel.update(
      {
        order_index: values.order_index,
        title: values.title,
        artwork_date: values.artwork_date,
        description: values.description,
        caption_medium: values.caption_medium,
        physical_dimensions: values.physical_dimensions,
        image_url: values.image_url,
        video_url: values.video_url,
        group_key: values.group_key,
        group_display: values.group_display,
        types: values.types,
        info: values.info,
        resolution: values.resolution,
        main_media_bytes: values.main_media_bytes,
        extra_images: values.extra_images,
        extra_descriptions: values.extra_descriptions,
        extra_titles: values.extra_titles,
        extra_caption_media: values.extra_caption_media,
        extra_physical_dimensions: values.extra_physical_dimensions,
        extra_resolutions: values.extra_resolutions,
        extra_media_bytes: values.extra_media_bytes,
      },
      { where: { id }, transaction: opts?.transaction },
    );
  }

  async deleteById(id: string, opts?: { transaction?: Transaction }): Promise<boolean> {
    const n = await this.artworkModel.destroy({ where: { id }, transaction: opts?.transaction });
    return n > 0;
  }

  async findBlobFieldsById(id: string): Promise<ArtworkBlobRow | null> {
    const row = await this.artworkModel.findByPk(id, {
      attributes: ['image_url', 'video_url', 'extra_images'],
    });
    if (!row) return null;
    return {
      image_url: row.image_url,
      video_url: row.video_url,
      extra_images: row.extra_images,
    };
  }
}
