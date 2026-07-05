import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request, Response } from 'express';
import { Logger } from 'nestjs-pino';
import type { Logger as PinoLogger } from 'pino';
import {
  CRITICAL_ERROR_EVENT,
  CriticalErrorPayload,
  ErrorResponse,
} from './error-response.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(Logger) private readonly logger: PinoLogger,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const correlationId =
      request.correlationId ||
      (request as Request & { id?: string }).id ||
      'unknown';

    let validationErrors: Record<string, string[]> | string[] | null = null;
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        if (responseObj.errors) {
          validationErrors = responseObj.errors as Record<string, string[]>;
        } else if (Array.isArray(responseObj.message)) {
          validationErrors = responseObj.message as string[];
          message = `Validation failed: ${validationErrors.join(', ')}`;
        }
      }
    }

    const logContext = {
      correlationId,
      statusCode: status,
      path: request.url,
      method: request.method,
      validationErrors,
    };

    if (status >= 500) {
      this.logger.error(
        {
          ...logContext,
          err: exception instanceof Error ? exception : new Error(String(exception)),
        },
        `Critical error: ${request.method} ${request.url}`,
      );
    } else {
      this.logger.warn({ ...logContext, message }, `Client error: ${request.method} ${request.url}`);
    }

    if (status >= 500) {
      const payload: CriticalErrorPayload = {
        message,
        statusCode: status,
        method: request.method,
        url: request.url,
        correlationId,
        error: exception instanceof Error ? exception : new Error(String(exception)),
      };
      this.eventEmitter.emit(CRITICAL_ERROR_EVENT, payload);
    }

    const responseData: ErrorResponse = {
      success: false,
      message,
      correlationId,
    };

    if (validationErrors) {
      responseData.errors = validationErrors;
    }

    response.status(status).json(responseData);
  }
}
