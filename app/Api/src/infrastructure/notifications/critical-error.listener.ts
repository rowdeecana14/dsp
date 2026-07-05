import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { CriticalErrorPayload } from '../../core/exceptions/error-response.interface';
import { CRITICAL_ERROR_EVENT } from '../../core/exceptions/error-response.interface';
import { EmailService } from './email.service';
import { SlackService } from './slack.service';

@Injectable()
export class CriticalErrorListener {
  constructor(
    private readonly slackService: SlackService,
    private readonly emailService: EmailService,
  ) {}

  @OnEvent(CRITICAL_ERROR_EVENT, { async: true })
  async handleCriticalError(payload: CriticalErrorPayload) {
    const alertMessage = `Critical error occurred at ${payload.method} ${payload.url}\nStatus: ${payload.statusCode}\nMessage: ${payload.message}\nCorrelation ID: ${payload.correlationId}`;

    await Promise.allSettled([
      this.slackService.sendCriticalAlert(alertMessage, payload.error),
      this.emailService.sendCriticalAlert(alertMessage, payload.error),
    ]);
  }
}
