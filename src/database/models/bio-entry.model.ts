import { Table, Column, Model, DataType, PrimaryKey, Default, IsUUID } from 'sequelize-typescript';

@Table({ tableName: 'bio_entries', underscored: true, createdAt: false, updatedAt: 'updated_at' })
export class BioEntry extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @IsUUID(4)
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.STRING)
  declare locale: string;

  @Column(DataType.TEXT)
  declare content: string;

  @Column(DataType.BOOLEAN)
  declare is_published: boolean;
}
