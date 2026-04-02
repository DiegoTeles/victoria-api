import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  IsUUID,
  HasMany,
} from 'sequelize-typescript';
import { CategoryTranslation } from './category-translation.model';
import { Subcategory } from './subcategory.model';

@Table({ tableName: 'categories', underscored: true })
export class Category extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @IsUUID(4)
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.STRING)
  declare slug: string;

  @Column(DataType.INTEGER)
  declare sort_order: number;

  @Column(DataType.BOOLEAN)
  declare is_active: boolean;

  @HasMany(() => CategoryTranslation)
  declare translations: CategoryTranslation[];

  @HasMany(() => Subcategory)
  declare subcategories: Subcategory[];
}
