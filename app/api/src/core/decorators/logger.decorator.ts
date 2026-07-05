import { Logger } from 'nestjs-pino';
import { createParamDecorator, ExecutionContext, Inject } from '@nestjs/common';

export const InjectLogger = createParamDecorator((_data: unknown, ctx: ExecutionContext): Logger => {
  const request = ctx.switchToHttp().getRequest();
  return request.logger || request.app.get(Logger);
});

export const InjectPinoLogger = () => Inject(Logger);
