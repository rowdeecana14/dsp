import { z } from 'zod';
import { boolPreprocess, numPreprocess, optStrPreprocess } from '../zod.helpers';

export const notificationSchema = z.object({
  ENABLE_EMAIL_ALERTS: z.preprocess(
    boolPreprocess,
    z.boolean().default(false),
  ),

  EMAIL_ALERT_RECIPIENT: z.preprocess(
    optStrPreprocess,
    z.string().email().optional(),
  ),

  SLACK_WEBHOOK_URL: z.preprocess(
    optStrPreprocess,
    z.string().url().optional(),
  ),

  ENABLE_SLACK_ALERTS: z.preprocess(
    boolPreprocess,
    z.boolean().default(false),
  ),

  NOTIFICATION_RETRY_COUNT: z.preprocess(
    numPreprocess,
    z.number().int().min(0).max(10).default(3),
  ),

  NOTIFICATION_TIMEOUT_MS: z.preprocess(
    numPreprocess,
    z.number().int().positive().default(5000),
  ),

  ENABLE_NOTIFICATION_LOGGING: z.preprocess(
    boolPreprocess,
    z.boolean().default(false),
  ),
});