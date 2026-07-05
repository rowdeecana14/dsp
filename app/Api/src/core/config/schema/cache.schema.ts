import { z } from 'zod';
import { boolPreprocess, numPreprocess } from '../zod.helpers';

export const cacheSchema = z.object({
  CACHE_TTL: z.preprocess(
    numPreprocess,
    z.number().int().positive().default(300),
  ),

  USE_REDIS_CACHE: z.preprocess(
    boolPreprocess,
    z.boolean().default(false),
  ),

  REDIS_HOST: z.string().default('localhost'),

  REDIS_PORT: z.preprocess(
    numPreprocess,
    z.number().int().positive().default(6379),
  ),

  CACHE_MAX_ITEMS: z.preprocess(
    numPreprocess,
    z.number().int().positive().default(1000),
  ),

  ENABLE_CACHE_COMPRESSION: z.preprocess(
    boolPreprocess,
    z.boolean().default(false),
  ),

  ENABLE_CACHE_LOGGING: z.preprocess(
    boolPreprocess,
    z.boolean().default(false),
  ),

  CACHE_PREFIX: z.string().default('app'),

  ENABLE_HTTP_CACHE: z.preprocess(
    boolPreprocess,
    z.boolean().default(true),
  ),

  CACHE_EVICTION_POLICY: z.enum(['LRU', 'LFU', 'FIFO']).default('LRU'),
});