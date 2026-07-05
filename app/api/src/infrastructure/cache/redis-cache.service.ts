import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import Redis from 'ioredis';
import type { CacheStore } from './cache-store.interface';

@Injectable()
export class RedisCacheService implements CacheStore, OnModuleDestroy {
  private readonly redis: Redis | null;
  private readonly defaultTTL: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(RedisCacheService.name);
    this.defaultTTL = this.configService.get<number>('cache.ttl', 300);

    if (this.configService.get<boolean>('cache.useRedis')) {
      this.redis = new Redis({
        host: this.configService.get<string>('cache.redisHost', 'localhost'),
        port: this.configService.get<number>('cache.redisPort', 6379),
        retryStrategy: (times) => Math.min(times * 50, 2000),
        maxRetriesPerRequest: 3,
      });

      this.redis.on('error', (err) => {
        this.logger.error({ err }, 'Redis connection error');
      });
    } else {
      this.redis = null;
    }
  }

  private get client(): Redis {
    if (!this.redis) {
      throw new Error('Redis cache is not enabled');
    }
    return this.redis;
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);
    const expiry = ttl || this.defaultTTL;
    await this.client.setex(key, expiry, serializedValue);
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async deletePattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async clear(): Promise<void> {
    await this.client.flushdb();
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async increment(key: string, amount = 1): Promise<number> {
    return this.client.incrby(key, amount);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  generateKey(prefix: string, identifier: string): string {
    const cachePrefix = this.configService.get<string>('cache.prefix', 'app');
    return `${cachePrefix}:${prefix}:${identifier}`;
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}
