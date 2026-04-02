import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  IsUUID,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Artwork } from './artwork.model';
import { Category } from './category.model';
import { Subcategory } from './subcategory.model';

@Table({ tableName: 'artwork_categories', underscored: true, timestamps: false })
export class ArtworkCategory extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @IsUUID(4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Artwork)
  @Column(DataType.STRING)
  declare artwork_id: string;

  @ForeignKey(() => Category)
  @Column(DataType.UUID)
  declare category_id: string;

  @ForeignKey(() => Subcategory)
  @Column(DataType.UUID)
  declare subcategory_id: string | null;

  @BelongsTo(() => Artwork)
  declare artwork: Artwork;

  @BelongsTo(() => Category)
  declare category: Category;

  @BelongsTo(() => Subcategory)
  declare subcategory: Subcategory | null;
}
