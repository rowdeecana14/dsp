import { registerAs } from '@nestjs/config';
import { rateLimitSchema } from './schema/rate-limit.schema';

export const rateLimitNamespaceConfig = registerAs('rateLimit', () => {
  const env = rateLimitSchema.parse(process.env);
  return {
    enabled: env.ENABLE_RATE_LIMIT,
    ttl: env.RATE_LIMIT_TTL,
    max: env.RATE_LIMIT_MAX,
    useRedis: env.USE_REDIS_RATE_LIMIT,
  };
});
