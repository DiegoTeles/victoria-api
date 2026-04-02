import {
  Table,
  Column,
  DataType,
  PrimaryKey,
  Default,
  IsUUID,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { Category } from './category.model';
import { SubcategoryTranslation } from './subcategory-translation.model';

@Table({ tableName: 'subcategories', underscored: true })
export class Subcategory extends BaseModel {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @IsUUID(4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Category)
  @Column(DataType.UUID)
  declare category_id: string;

  @Column(DataType.STRING)
  declare slug: string;

  @Column(DataType.INTEGER)
  declare sort_order: number;

  @Column(DataType.BOOLEAN)
  declare is_active: boolean;

  @BelongsTo(() => Category)
  declare category: Category;

  @HasMany(() => SubcategoryTranslation)
  declare translations: SubcategoryTranslation[];
}
