import type { Transaction } from 'sequelize';
import type { Artwork } from '../../database/models/artwork.model';

export type ArtworkBlobRow = {
  image_url: string | null;
  video_url: string | null;
  extra_images: unknown;
};

export type ArtworkInsertPayload = {
  id: string;
  order_index: number;
  title: string;
  artwork_date: string;
  description: object;
  caption_medium: object;
  physical_dimensions: object;
  image_url: string | null;
  video_url: string | null;
  group_key: string | null;
  group_display: string | null;
  types: unknown[];
  info: unknown;
  resolution: unknown;
  main_media_bytes: number | null;
  extra_images: string[];
  extra_descriptions: unknown[];
  extra_titles: unknown[];
  extra_caption_media: unknown[];
  extra_physical_dimensions: unknown[];
  extra_resolutions: unknown[];
  extra_media_bytes: unknown[];
};

export interface IArtworksRepository {
  findAllOrdered(): Promise<Artwork[]>;
  findById(id: string): Promise<Artwork | null>;
  create(values: ArtworkInsertPayload, opts?: { transaction?: Transaction }): Promise<Artwork>;
  update(id: string, values: ArtworkInsertPayload, opts?: { transaction?: Transaction }): Promise<void>;
  deleteById(id: string, opts?: { transaction?: Transaction }): Promise<boolean>;
  findBlobFieldsById(id: string): Promise<ArtworkBlobRow | null>;
}
