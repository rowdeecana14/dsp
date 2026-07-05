import { z } from 'zod';
import { boolPreprocess } from '../zod.helpers';

export const databaseSchema = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_DATABASE: z.string(),
  DB_SYNCHRONIZE: z.preprocess(
    boolPreprocess,
    z.boolean().default(false),
  ),
  DB_CONNECTION_LIMIT: z.coerce.number().default(10),
  DB_MAX_IDLE: z.coerce.number().default(5),
  DB_IDLE_TIMEOUT: z.coerce.number().default(60000),
  DB_MIGRATION_TABLE: z.string().default('migrations'),
  DB_LOGGING: z.preprocess(
    boolPreprocess,
    z.boolean().default(false),
  ),
  DB_SSL: z.preprocess(
    boolPreprocess,
    z.boolean().default(false),
  ),
  DB_SSL_REJECT_UNAUTHORIZED: z.preprocess(
    boolPreprocess,
    z.boolean().default(false),
  ),
});