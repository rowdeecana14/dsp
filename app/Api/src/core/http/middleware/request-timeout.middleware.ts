import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RequestTimeoutMiddleware implements NestMiddleware {
  private readonly timeout: number;
  private readonly enabled: boolean;

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('app.enableRequestTimeout', true);
    this.timeout = this.configService.get<number>('request.timeoutMs', 30000);
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (!this.enabled) {
      return next();
    }

    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          message: 'Request timeout',
          timeout: this.timeout,
        });
      }
    }, this.timeout);

    res.on('finish', () => clearTimeout(timeoutId));
    res.on('error', () => clearTimeout(timeoutId));

    next();
  }
}
