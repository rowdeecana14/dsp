import { Global, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { CacheModule } from '../../infrastructure/cache/cache.module';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { CorrelationIdInterceptor } from './interceptors/correlation-id.interceptor';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';
import { RequestTimeoutMiddleware } from './middleware/request-timeout.middleware';
import { SecurityHeadersMiddleware } from './middleware/security-headers.middleware';
import { RequestValidationPipe } from './pipes/request-validation.pipe';
import { SanitizePipe } from './pipes/sanitize.pipe';

@Global()
@Module({
  imports: [CacheModule],
  providers: [
    SecurityHeadersMiddleware,
    RequestTimeoutMiddleware,
    RateLimitMiddleware,
    ApiKeyGuard,
    CorrelationIdInterceptor,
    {
      provide: APP_GUARD,
      useExisting: ApiKeyGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useExisting: CorrelationIdInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: RequestValidationPipe,
    },
    {
      provide: APP_PIPE,
      useClass: SanitizePipe,
    },
  ],
  exports: [CacheModule],
})
export class HttpModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityHeadersMiddleware, RequestTimeoutMiddleware, RateLimitMiddleware)
      .forRoutes({ path: '{*splat}', method: RequestMethod.ALL });
  }
}
