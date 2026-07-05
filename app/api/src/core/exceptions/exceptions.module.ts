import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GlobalExceptionFilter } from './global-exception.filter';

@Global()
@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [
    GlobalExceptionFilter,
    {
      provide: APP_FILTER,
      useExisting: GlobalExceptionFilter,
    },
  ],
})
export class ExceptionsModule {}
