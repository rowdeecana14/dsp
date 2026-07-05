import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class EmailService {
  private readonly enabled: boolean;
  private readonly recipientEmail: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(EmailService.name);
    this.enabled = this.configService.get<boolean>(
      'notification.enableEmailAlerts',
      false,
    );
    this.recipientEmail =
      this.configService.get<string>('notification.emailRecipient', '') ?? '';
  }

  sendCriticalAlert(message: string, error?: Error): Promise<void> {
    if (!this.enabled || !this.recipientEmail) {
      return Promise.resolve();
    }

    try {
      const subject = `[CRITICAL] ${this.configService.get('app.nodeEnv', 'unknown')} - System Error`;

      this.logger.info(
        {
          recipient: this.recipientEmail,
          subject,
          message,
          error: error?.message,
        },
        '[EMAIL MOCK] Would send critical alert',
      );
    } catch (err: unknown) {
      this.logger.error({ err }, 'Failed to send email alert');
    }

    return Promise.resolve();
  }
}
