import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
} from 'sequelize-typescript';
import { Category } from './category.model';

@Table({ tableName: 'category_translations', underscored: true, timestamps: false })
export class CategoryTranslation extends Model {
  @PrimaryKey
  @ForeignKey(() => Category)
  @Column(DataType.UUID)
  declare category_id: string;

  @PrimaryKey
  @Column(DataType.STRING)
  declare locale: string;

  @Column(DataType.STRING)
  declare name: string;

  @BelongsTo(() => Category)
  declare category: Category;
}
