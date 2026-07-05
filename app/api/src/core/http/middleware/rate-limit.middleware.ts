import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { CACHE_STORE, type CacheStore } from '../../../infrastructure/cache/cache-store.interface';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly store: Map<string, RateLimitStore> = new Map();
  private readonly ttl: number;
  private readonly maxRequests: number;
  private readonly useRedis: boolean;
  private readonly enabled: boolean;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(CACHE_STORE) private readonly cacheStore: CacheStore,
  ) {
    this.enabled = this.configService.get<boolean>('rateLimit.enabled', true);
    this.ttl = this.configService.get<number>('rateLimit.ttl', 60) * 1000;
    this.maxRequests = this.configService.get<number>('rateLimit.max', 100);
    this.useRedis = this.configService.get<boolean>('rateLimit.useRedis', false);
  }

  async use(req: Request, res: Response, next: NextFunction) {
    if (!this.enabled) {
      return next();
    }

    const clientId = this.getClientId(req);

    if (this.useRedis) {
      await this.handleRedisRateLimit(clientId, res, next);
    } else {
      this.handleInMemoryRateLimit(clientId, res, next);
    }
  }

  private async handleRedisRateLimit(clientId: string, res: Response, next: NextFunction) {
    try {
      const key = `ratelimit:${clientId}`;
      const current = await this.cacheStore.increment(key);

      if (current === 1) {
        await this.cacheStore.expire(key, this.ttl / 1000);
      }

      if (current > this.maxRequests) {
        const ttl = await this.cacheStore.ttl(key);
        this.setRateLimitHeaders(res, 0, ttl);
        return res.status(429).json({
          success: false,
          message: 'Too many requests. Please try again later.',
          retryAfter: ttl,
        });
      }

      const remaining = this.maxRequests - current;
      const ttl = await this.cacheStore.ttl(key);
      this.setRateLimitHeaders(res, remaining, ttl);
      next();
    } catch {
      this.handleInMemoryRateLimit(clientId, res, next);
    }
  }

  private handleInMemoryRateLimit(clientId: string, res: Response, next: NextFunction) {
    const now = Date.now();
    const record = this.store.get(clientId);

    if (record && now > record.resetTime) {
      this.store.delete(clientId);
    }

    const currentRecord = this.store.get(clientId) || {
      count: 0,
      resetTime: now + this.ttl,
    };

    if (currentRecord.count >= this.maxRequests) {
      const resetTime = Math.ceil((currentRecord.resetTime - now) / 1000);
      this.setRateLimitHeaders(res, 0, resetTime);
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: resetTime,
      });
    }

    currentRecord.count++;
    this.store.set(clientId, currentRecord);

    const remaining = this.maxRequests - currentRecord.count;
    const resetTime = Math.ceil((currentRecord.resetTime - now) / 1000);
    this.setRateLimitHeaders(res, remaining, resetTime);
    next();
  }

  private setRateLimitHeaders(res: Response, remaining: number, reset: number) {
    res.setHeader('X-RateLimit-Limit', this.maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', reset.toString());
  }

  private getClientId(req: Request): string {
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
}
