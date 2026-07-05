import { Module } from '@nestjs/common';
import { LoggingModule } from '../../core/logging/logging.module';
import { CriticalErrorListener } from './critical-error.listener';
import { EmailService } from './email.service';
import { SlackService } from './slack.service';

@Module({
  imports: [LoggingModule],
  providers: [SlackService, EmailService, CriticalErrorListener],
  exports: [SlackService, EmailService],
})
export class NotificationsModule {}
