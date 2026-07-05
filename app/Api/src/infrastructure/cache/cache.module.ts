import { Global, Module } from '@nestjs/common';
import { LoggingModule } from '../../core/logging/logging.module';
import { ConfigService } from '@nestjs/config';
import { CACHE_STORE } from './cache-store.interface';
import { CacheService } from './cache.service';
import { RedisCacheService } from './redis-cache.service';

@Global()
@Module({
  imports: [LoggingModule],
  providers: [
    CacheService,
    RedisCacheService,
    {
      provide: CACHE_STORE,
      useFactory: (
        configService: ConfigService,
        redisCache: RedisCacheService,
        memoryCache: CacheService,
      ) =>
        configService.get<boolean>('cache.useRedis') ? redisCache : memoryCache,
      inject: [ConfigService, RedisCacheService, CacheService],
    },
  ],
  exports: [CACHE_STORE],
})
export class CacheModule {}
