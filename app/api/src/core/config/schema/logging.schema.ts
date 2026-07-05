import { z } from 'zod';
import { boolPreprocess } from '../zod.helpers';

export const loggingSchema = z.object({
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  ENABLE_FILE_LOG: z.preprocess(
    boolPreprocess,
    z.boolean().default(true),
  ),
  ENABLE_CONSOLE_LOG: z.preprocess(
    boolPreprocess,
    z.boolean().default(true),
  ),
});