import path from 'path';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { DefaultNamingStrategy } from 'typeorm';
import { parseEnvBoolean } from '../config/zod.helpers';

const rootDir = path.resolve(__dirname, '..', '..');

export const entityGlob = path.join(rootDir, '**/*.entity.{ts,js}');
export const subscriberGlob = path.join(rootDir, '**/*.subscriber.{ts,js}');
export const migrationGlob = path.join(rootDir, 'database/migrations/*.{ts,js}');

function buildBaseOptions(configService: ConfigService) {
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const isProduction = nodeEnv === 'production';
  const isTest = nodeEnv === 'test';

  const host = configService.get<string>('DB_HOST');
  const username = configService.get<string>('DB_USER');
  const password = configService.get<string>('DB_PASSWORD');
  const database = configService.get<string>('DB_DATABASE');

  if (!host || !username || !password || !database) {
    throw new Error('Missing required database configuration: DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE');
  }

  const sslEnabled =
    configService.get<boolean>('database.ssl') ??
    parseEnvBoolean(configService.get('DB_SSL'), false);
  const sslRejectUnauthorized =
    configService.get<boolean>('database.sslRejectUnauthorized') ??
    parseEnvBoolean(configService.get('DB_SSL_REJECT_UNAUTHORIZED'), false);

  const baseOptions = {
    type: 'mysql' as const,
    host,
    port: configService.get<number>('DB_PORT', 3306),
    username,
    password,
    database,
    synchronize: false,
    migrationsRun: false,
    logging:
      isTest ? false : parseEnvBoolean(configService.get('DB_LOGGING'), false),
    namingStrategy: new DefaultNamingStrategy(),
    entities: [entityGlob],
    migrations: [migrationGlob],
    subscribers: [subscriberGlob],
    migrationsTableName: configService.get<string>('DB_MIGRATION_TABLE', 'migrations'),
    extra: {
      connectionLimit: configService.get<number>('DB_CONNECTION_LIMIT', 10),
      maxIdle: configService.get<number>('DB_MAX_IDLE', 5),
      idleTimeout: configService.get<number>('DB_IDLE_TIMEOUT', 60000),
    },
    ...(isProduction && {
      keepConnectionAlive: true,
      retryAttempts: 3,
      retryDelay: 3000,
    }),
  };

  if (sslEnabled) {
    return {
      ...baseOptions,
      ssl: { rejectUnauthorized: sslRejectUnauthorized },
    };
  }

  return baseOptions;
}

export function buildTypeOrmModuleOptions(configService: ConfigService): TypeOrmModuleOptions {
  return {
    ...buildBaseOptions(configService),
    autoLoadEntities: true,
  };
}

export function buildTypeOrmOptions(configService: ConfigService): DataSourceOptions {
  return buildBaseOptions(configService);
}
