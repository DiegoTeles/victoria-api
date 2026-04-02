import { Table, Column, DataType, PrimaryKey, Default, IsUUID } from 'sequelize-typescript';
import { BaseModel } from './base.model';

@Table({ tableName: 'social_links', underscored: true, createdAt: false, updatedAt: 'updated_at' })
export class SocialLink extends BaseModel {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @IsUUID(4)
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.STRING)
  declare network: string;

  @Column(DataType.STRING)
  declare url: string;

  @Column(DataType.STRING)
  declare label: string | null;

  @Column(DataType.INTEGER)
  declare sort_order: number;

  @Column(DataType.BOOLEAN)
  declare is_active: boolean;
}
