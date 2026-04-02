import { Table, Column, DataType, PrimaryKey, HasMany } from 'sequelize-typescript';
import { ArtworkCategory } from './artwork-category.model';
import { BaseModel } from './base.model';

@Table({ tableName: 'artworks', underscored: true })
export class Artwork extends BaseModel {
  @PrimaryKey
  @Column(DataType.STRING)
  declare id: string;

  @Column(DataType.INTEGER)
  declare order_index: number;

  @Column(DataType.STRING)
  declare title: string;

  @Column(DataType.DATEONLY)
  declare artwork_date: string;

  @Column(DataType.JSONB)
  declare description: Record<string, unknown>;

  @Column(DataType.JSONB)
  declare caption_medium: Record<string, unknown>;

  @Column(DataType.JSONB)
  declare physical_dimensions: Record<string, unknown>;

  @Column(DataType.STRING)
  declare image_url: string | null;

  @Column(DataType.STRING)
  declare video_url: string | null;

  @Column(DataType.STRING)
  declare group_key: string | null;

  @Column(DataType.STRING)
  declare group_display: string | null;

  @Column(DataType.JSONB)
  declare types: unknown[];

  @Column(DataType.JSONB)
  declare info: unknown;

  @Column(DataType.JSONB)
  declare resolution: unknown;

  @Column(DataType.INTEGER)
  declare main_media_bytes: number | null;

  @Column(DataType.JSONB)
  declare extra_images: string[];

  @Column(DataType.JSONB)
  declare extra_descriptions: unknown[];

  @Column(DataType.JSONB)
  declare extra_titles: unknown[];

  @Column(DataType.JSONB)
  declare extra_caption_media: unknown[];

  @Column(DataType.JSONB)
  declare extra_physical_dimensions: unknown[];

  @Column(DataType.JSONB)
  declare extra_resolutions: unknown[];

  @Column(DataType.JSONB)
  declare extra_media_bytes: unknown[];

  @HasMany(() => ArtworkCategory)
  declare artworkCategories: ArtworkCategory[];
}
