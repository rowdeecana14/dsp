import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CacheStore } from './cache-store.interface';

@Injectable()
export class CacheService implements CacheStore {
  private cache: Map<string, { value: unknown; expiry: number }> = new Map();
  private readonly defaultTTL: number;

  constructor(private readonly configService: ConfigService) {
    this.defaultTTL = this.configService.get<number>('cache.ttl', 300) * 1000;
  }

  set(key: string, value: unknown, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expiry });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  increment(key: string, amount = 1): Promise<number> {
    const current = (this.get<number>(key) ?? 0) + amount;
    this.set(key, current);
    return Promise.resolve(current);
  }

  expire(key: string, seconds: number): Promise<void> {
    const value = this.get(key);
    if (value !== null) {
      this.set(key, value, seconds * 1000);
    }
    return Promise.resolve();
  }

  ttl(key: string): Promise<number> {
    const item = this.cache.get(key);
    if (!item) return Promise.resolve(-1);
    return Promise.resolve(
      Math.max(0, Math.ceil((item.expiry - Date.now()) / 1000)),
    );
  }
}
