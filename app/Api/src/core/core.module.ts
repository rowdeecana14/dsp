import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { LoggingModule } from './logging/logging.module';
import { DatabaseModule } from './database/database.module';
import { ExceptionsModule } from './exceptions/exceptions.module';
import { HttpModule } from './http/http.module';
import { HealthModule } from './health/health.module';
import { NotificationsModule } from '../infrastructure/notifications/notifications.module';
import { SeederService } from './database/seeder.service';

@Module({
  imports: [
    AppConfigModule,
    LoggingModule,
    DatabaseModule,
    ExceptionsModule,
    NotificationsModule,
    HttpModule,
    HealthModule,
  ],
  providers: [SeederService],
  exports: [
    AppConfigModule,
    LoggingModule,
    DatabaseModule,
    HttpModule,
    SeederService,
  ],
})
export class CoreModule {}
