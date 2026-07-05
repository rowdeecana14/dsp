import { z } from 'zod';
import { boolPreprocess } from '../zod.helpers';

export const appSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  CORS_ORIGIN: z.string().default('*'),
  ENABLE_SWAGGER: z.preprocess(
    boolPreprocess,
    z.boolean().default(true),
  ),
  ENABLE_COMPRESSION: z.preprocess(
    boolPreprocess,
    z.boolean().default(true),
  ),
  ENABLE_API_VERSIONING: z.preprocess(
    boolPreprocess,
    z.boolean().default(true),
  ),
  ENABLE_REQUEST_TIMEOUT: z.preprocess(
    boolPreprocess,
    z.boolean().default(true),
  ),
});