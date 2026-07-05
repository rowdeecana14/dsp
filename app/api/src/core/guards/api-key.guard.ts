import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { timingSafeEqual } from 'crypto';
import { API_KEY_PUBLIC_KEY } from '../decorators/api-key.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly validApiKeys: string[];
  private readonly enabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {
    const apiKey = this.configService.get<string>('request.apiKey');
    this.validApiKeys = apiKey
      ? apiKey.split(',').map((key) => key.trim()).filter(Boolean)
      : [];
    this.enabled = this.validApiKeys.length > 0;
  }

  canActivate(context: ExecutionContext): boolean {
    if (!this.enabled) {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(API_KEY_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('API key is missing');
    }

    if (!this.isValidKey(apiKey)) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }

  private isValidKey(provided: string): boolean {
    return this.validApiKeys.some((valid) => {
      if (valid.length !== provided.length) {
        return false;
      }
      return timingSafeEqual(Buffer.from(valid), Buffer.from(provided));
    });
  }

  private extractApiKey(request: {
    headers: Record<string, unknown>;
    query?: Record<string, unknown>;
  }): string | null {
    const apiKeyHeader = request.headers['x-api-key'] as string;
    if (apiKeyHeader) {
      return apiKeyHeader;
    }

    const apiKeyQuery = request.query?.['api_key'] as string;
    if (apiKeyQuery) {
      return apiKeyQuery;
    }

    return null;
  }
}
