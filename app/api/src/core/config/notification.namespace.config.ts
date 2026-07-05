import { registerAs } from '@nestjs/config';
import { notificationSchema } from './schema/notification.schema';

export const notificationNamespaceConfig = registerAs('notification', () => {
  const env = notificationSchema.parse(process.env);
  return {
    enableEmailAlerts: env.ENABLE_EMAIL_ALERTS,
    emailRecipient: env.EMAIL_ALERT_RECIPIENT,
    slackWebhookUrl: env.SLACK_WEBHOOK_URL,
    enableSlackAlerts: env.ENABLE_SLACK_ALERTS,
    retryCount: env.NOTIFICATION_RETRY_COUNT,
    timeoutMs: env.NOTIFICATION_TIMEOUT_MS,
    enableLogging: env.ENABLE_NOTIFICATION_LOGGING,
  };
});
