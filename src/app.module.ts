import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ArtworksModule } from './artworks/artworks.module';
import { CategoriesModule } from './categories/categories.module';
import { AboutModule } from './about/about.module';
import { CurriculumModule } from './curriculum/curriculum.module';
import { SocialModule } from './social/social.module';
import { BlobModule } from './blob/blob.module';
import { OgModule } from './og/og.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transports: [
          new winston.transports.Console({
            level: config.get<string>('nodeEnv') === 'production' ? 'info' : 'debug',
            format: winston.format.combine(
              winston.format.timestamp(),
              config.get<string>('nodeEnv') === 'production'
                ? winston.format.json()
                : winston.format.printf((info) => {
                    const { timestamp, level, message, ...rest } = info;
                    const meta = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : '';
                    return `${String(timestamp)} ${level}: ${String(message)}${meta}`;
                  }),
            ),
          }),
        ],
      }),
    }),
    DatabaseModule,
    AuthModule,
    HealthModule,
    ArtworksModule,
    CategoriesModule,
    AboutModule,
    CurriculumModule,
    SocialModule,
    BlobModule,
    OgModule,
  ],
})
export class AppModule {}
