import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration, validationSchema } from './configuration';
import { appConfig } from './app.config';
import { databaseNamespaceConfig } from './database.namespace.config';
import { loggingNamespaceConfig } from './logging.namespace.config';
import { cacheNamespaceConfig } from './cache.namespace.config';
import { notificationNamespaceConfig } from './notification.namespace.config';
import { rateLimitNamespaceConfig } from './rate-limit.namespace.config';
import { requestNamespaceConfig } from './request.namespace.config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local', '.env.development', '.env.production'],
      load: [
        configuration,
        appConfig,
        databaseNamespaceConfig,
        loggingNamespaceConfig,
        cacheNamespaceConfig,
        notificationNamespaceConfig,
        rateLimitNamespaceConfig,
        requestNamespaceConfig,
      ],
      validate: (config) => validationSchema.parse(config),
      cache: true,
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
