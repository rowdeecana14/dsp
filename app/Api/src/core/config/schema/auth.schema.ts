import { z } from 'zod';

export const authSchema = z.object({
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRATION_TIME: z.string().default('24h'),
  JWT_REFRESH_EXPIRATION_TIME: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(8).max(16).default(12),
});