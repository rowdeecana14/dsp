import { z } from 'zod';

import { boolPreprocess } from '../zod.helpers';

export const rateLimitSchema = z.object({
  ENABLE_RATE_LIMIT: z.preprocess(
    boolPreprocess,
    z.boolean().default(true),
  ),
  RATE_LIMIT_TTL: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  USE_REDIS_RATE_LIMIT: z.preprocess(
    boolPreprocess,
    z.boolean().default(false),
  ),
});
