import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request, Response } from 'express';
import { CORRELATION_ID_HEADER } from '../../logging/correlation.constants';

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request & { id?: string }>();
    const response = context.switchToHttp().getResponse<Response>();
    const correlationId =
      request.correlationId ||
      request.id ||
      (request.headers[CORRELATION_ID_HEADER] as string) ||
      undefined;

    if (correlationId) {
      request.correlationId = String(correlationId);
      if (!response.headersSent) {
        response.setHeader(CORRELATION_ID_HEADER, request.correlationId);
      }
    }

    return next.handle();
  }
}
