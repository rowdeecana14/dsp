import { ConfigFactory } from '@nestjs/config';
import { z } from 'zod';

// Import all schemas
import { appSchema } from './schema/app.schema';
import { authSchema } from './schema/auth.schema';
import { databaseSchema } from './schema/database.schema';
import { cacheSchema } from './schema/cache.schema';
import { auditSchema } from './schema/audit.schema';
import { notificationSchema } from './schema/notification.schema';
import { loggingSchema } from './schema/logging.schema';
import { rateLimitSchema } from './schema/rate-limit.schema';
import { requestSchema } from './schema/request.schema';

// Combine all schemas into one
const configSchema = z.object({
  ...appSchema.shape,
  ...authSchema.shape,
  ...databaseSchema.shape,
  ...cacheSchema.shape,
  ...auditSchema.shape,
  ...notificationSchema.shape,
  ...loggingSchema.shape,
  ...rateLimitSchema.shape,
  ...requestSchema.shape,
});

// Type inference from schema
export type AppConfig = z.infer<typeof configSchema>;

// Flat env config factory for backward-compatible ConfigService.get('KEY')
export const configuration: ConfigFactory = () => process.env;

// Export schema for validation
export const validationSchema = configSchema;
