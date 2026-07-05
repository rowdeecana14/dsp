import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {
  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    const req = context.switchToHttp().getRequest<Request & { auth?: Record<string, unknown>; jwt?: string; user?: unknown }>();

    if (err || !user) {
      throw err || new UnauthorizedException('Unauthorized');
    }

    const authHeader = req.headers.authorization as string | undefined;
    const bearerToken = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
    const token = req.jwt ?? bearerToken ?? (req.auth?.token as string | undefined);

    req.auth = {
      ...(req.auth ?? {}),
      user,
      roles: (user as { roles?: string[] }).roles ?? [],
      permissions: (user as { permissions?: string[] }).permissions ?? [],
      token,
    };
    req.user = user;

    return user;
  }
}
