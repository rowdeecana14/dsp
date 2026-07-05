import { registerAs } from '@nestjs/config';
import { appSchema } from './schema/app.schema';

export const appConfig = registerAs('app', () => {
  const env = appSchema.parse(process.env);
  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    corsOrigin: env.CORS_ORIGIN,
    enableSwagger: env.ENABLE_SWAGGER,
    enableCompression: env.ENABLE_COMPRESSION,
    enableApiVersioning: env.ENABLE_API_VERSIONING,
    enableRequestTimeout: env.ENABLE_REQUEST_TIMEOUT,
  };
});
