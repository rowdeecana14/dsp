import { registerAs } from '@nestjs/config';
import { cacheSchema } from './schema/cache.schema';

export const cacheNamespaceConfig = registerAs('cache', () => {
  const env = cacheSchema.parse(process.env);
  return {
    ttl: env.CACHE_TTL,
    useRedis: env.USE_REDIS_CACHE,
    redisHost: env.REDIS_HOST,
    redisPort: env.REDIS_PORT,
    maxItems: env.CACHE_MAX_ITEMS,
    enableCompression: env.ENABLE_CACHE_COMPRESSION,
    enableLogging: env.ENABLE_CACHE_LOGGING,
    prefix: env.CACHE_PREFIX,
    enableHttpCache: env.ENABLE_HTTP_CACHE,
    evictionPolicy: env.CACHE_EVICTION_POLICY,
  };
});
