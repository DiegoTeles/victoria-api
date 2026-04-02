import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Artwork } from './models/artwork.model';
import { ArtworkCategory } from './models/artwork-category.model';
import { Category } from './models/category.model';
import { CategoryTranslation } from './models/category-translation.model';
import { Subcategory } from './models/subcategory.model';
import { SubcategoryTranslation } from './models/subcategory-translation.model';
import { BioEntry } from './models/bio-entry.model';
import { CurriculumEntry } from './models/curriculum-entry.model';
import { SocialLink } from './models/social-link.model';

const models = [
  Artwork,
  ArtworkCategory,
  Category,
  CategoryTranslation,
  Subcategory,
  SubcategoryTranslation,
  BioEntry,
  CurriculumEntry,
  SocialLink,
];

function parseDatabaseUrl(url: string) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: Number(u.port || 5432),
    username: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ''),
  };
}

@Global()
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow<string>('databaseUrl');
        const ssl = config.get<boolean>('databaseSsl');
        const conn = parseDatabaseUrl(url);
        return {
          dialect: 'postgres' as const,
          host: conn.host,
          port: conn.port,
          username: conn.username,
          password: conn.password,
          database: conn.database,
          dialectOptions: ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
          models,
          synchronize: false,
          logging: false,
        };
      },
    }),
    SequelizeModule.forFeature(models),
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
