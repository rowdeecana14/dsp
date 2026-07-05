import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  private readonly helmetHandler = helmet();

  use(req: Request, res: Response, next: NextFunction) {
    this.helmetHandler(req, res, next);
  }
}
