import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class SlackService {
  private readonly webhookUrl: string;
  private readonly enabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(SlackService.name);
    this.webhookUrl =
      this.configService.get<string>('notification.slackWebhookUrl', '') ?? '';
    this.enabled =
      this.configService.get<boolean>(
        'notification.enableSlackAlerts',
        false,
      ) && !!this.webhookUrl;
  }

  async sendAlert(
    message: string,
    level: 'error' | 'critical' = 'error',
  ): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      const color = level === 'critical' ? '#FF0000' : '#FFA500';
      const emoji = level === 'critical' ? ':rotating_light:' : ':warning:';

      const payload = {
        attachments: [
          {
            color,
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: `${emoji} ${level.toUpperCase()} Alert`,
                  emoji: true,
                },
              },
              {
                type: 'section',
                text: { type: 'mrkdwn', text: message },
              },
              {
                type: 'section',
                fields: [
                  {
                    type: 'mrkdwn',
                    text: `*Environment:*\n${this.configService.get('app.nodeEnv', 'unknown')}`,
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Timestamp:*\n${new Date().toISOString()}`,
                  },
                ],
              },
            ],
          },
        ],
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Slack webhook returned ${response.status}`);
      }

      this.logger.info({ level }, 'Slack alert sent successfully');
    } catch (error: unknown) {
      this.logger.error({ err: error }, 'Failed to send Slack alert');
    }
  }

  async sendCriticalAlert(message: string, error?: Error): Promise<void> {
    let fullMessage = message;

    if (error) {
      fullMessage += `\n\n*Error Details:*\n\`\`\`${error.message}\`\`\``;
      if (error.stack) {
        fullMessage += `\n\n*Stack Trace:*\n\`\`\`${error.stack.substring(0, 1000)}...\`\`\``;
      }
    }

    await this.sendAlert(fullMessage, 'critical');
  }
}
