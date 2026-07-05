import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { getLoggerConfig } from '../config/logger.config';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: getLoggerConfig(configService),
        forRoutes: ['{*splat}'],
      }),
    }),
  ],
  exports: [LoggerModule],
})
export class LoggingModule {}
