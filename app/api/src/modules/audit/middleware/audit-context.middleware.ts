import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { AuditContextService } from '../services/audit-context.service';

@Injectable()
export class AuditContextMiddleware implements NestMiddleware {
  constructor(private readonly auditContextService: AuditContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const context = {
      requestId: req.headers['x-request-id']?.toString() || randomUUID(),
      ipAddress: req.ip || req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']?.toString(),
      httpMethod: req.method,
      endpoint: req.originalUrl || req.url,
      statusCode: 200,
    };

    this.auditContextService.run(context, () => {
      res.setHeader('x-request-id', context.requestId);
      next();
      return Promise.resolve();
    });
  }
}
