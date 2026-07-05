import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { SwaggerModule } from '@nestjs/swagger';
import { getSwaggerConfig } from './core/config/swagger.config';
import { ConfigService } from '@nestjs/config';
import { VersioningType } from '@nestjs/common';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);

  const enableCompression = configService.get<boolean>('app.enableCompression', true);
  if (enableCompression) {
    app.use(compression());
  }

  app.enableCors({
    origin: configService.get<string>('app.corsOrigin', '*'),
    methods: configService.get<string>('request.corsAllowedMethods', 'GET,POST,PUT,PATCH,DELETE').split(','),
    allowedHeaders: configService.get<string>('request.corsAllowedHeaders', 'Content-Type,Authorization,x-api-key').split(','),
  });

  const enableVersioning = configService.get<boolean>('app.enableApiVersioning', true);
  if (enableVersioning) {
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
  }

  const logger = app.get(Logger);
  app.useLogger(logger);

  const enableSwagger = configService.get<boolean>('app.enableSwagger', true);
  if (enableSwagger) {
    const swaggerConfig = getSwaggerConfig(configService);
    const document = SwaggerModule.createDocument(app, swaggerConfig, {
      deepScanRoutes: true,
    });
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get<number>('app.port', 3000);

  await app.listen(port);
  logger.log(`Dental Viewer Backend (NestJS) listening on port ${port}`, 'Bootstrap');

  if (enableSwagger) {
    logger.log(`Swagger documentation available at http://localhost:${port}/api/docs`, 'Bootstrap');
  }
}

bootstrap();
