import { z } from 'zod';

export const requestSchema = z.object({
  MAX_REQUEST_SIZE: z.string().default('10mb'),
  MAX_FILE_SIZE: z.string().default('5mb'),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  CORS_ALLOWED_METHODS: z.string().default('GET,POST,PUT,PATCH,DELETE'),
  CORS_ALLOWED_HEADERS: z.string().default('Content-Type,Authorization,x-api-key'),
  PROTECTED_ROLES: z.string().default('superadmin,admin'),
  API_KEY: z.string().optional(),
});
