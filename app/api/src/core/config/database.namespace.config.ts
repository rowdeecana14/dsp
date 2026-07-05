import { registerAs } from '@nestjs/config';
import { databaseSchema } from './schema/database.schema';

export const databaseNamespaceConfig = registerAs('database', () => {
  const env = databaseSchema.parse(process.env);
  return {
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    synchronize: env.DB_SYNCHRONIZE,
    logging: env.DB_LOGGING,
    connectionLimit: env.DB_CONNECTION_LIMIT,
    maxIdle: env.DB_MAX_IDLE,
    idleTimeout: env.DB_IDLE_TIMEOUT,
    migrationTable: env.DB_MIGRATION_TABLE,
    ssl: env.DB_SSL,
    sslRejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED,
  };
});
