export interface CacheStore {
  increment(key: string, amount?: number): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
}

export const CACHE_STORE = Symbol('CACHE_STORE');
