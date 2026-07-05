import { registerAs } from '@nestjs/config';
import { requestSchema } from './schema/request.schema';

export const requestNamespaceConfig = registerAs('request', () => {
  const env = requestSchema.parse(process.env);
  return {
    maxRequestSize: env.MAX_REQUEST_SIZE,
    maxFileSize: env.MAX_FILE_SIZE,
    timeoutMs: env.REQUEST_TIMEOUT_MS,
    corsAllowedMethods: env.CORS_ALLOWED_METHODS,
    corsAllowedHeaders: env.CORS_ALLOWED_HEADERS,
    protectedRoles: env.PROTECTED_ROLES,
    apiKey: env.API_KEY,
  };
});
