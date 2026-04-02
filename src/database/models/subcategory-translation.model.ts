import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
} from 'sequelize-typescript';
import { Subcategory } from './subcategory.model';

@Table({ tableName: 'subcategory_translations', underscored: true, timestamps: false })
export class SubcategoryTranslation extends Model {
  @PrimaryKey
  @ForeignKey(() => Subcategory)
  @Column(DataType.UUID)
  declare subcategory_id: string;

  @PrimaryKey
  @Column(DataType.STRING)
  declare locale: string;

  @Column(DataType.STRING)
  declare name: string;

  @BelongsTo(() => Subcategory)
  declare subcategory: Subcategory;
}
