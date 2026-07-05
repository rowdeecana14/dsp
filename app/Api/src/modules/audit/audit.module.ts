import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogEntity } from './entities/audit-log.entity';
import { AuditService } from './services/audit.service';
import { AuditConfigService } from './services/audit-config.service';
import { AuditContextService } from './services/audit-context.service';
import { AuditController } from './controllers/audit.controller';
import { AuditContextMiddleware } from './middleware/audit-context.middleware';
import { AuditRequestInterceptor } from './interceptors/audit-request.interceptor';
import { AuditRepository } from './repositories/audit.repository';
import { AuditSubscriber } from './subscribers/audit.subscriber';
import { EntityAuditSubscriber } from './subscribers/entity-audit.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntity])],
  providers: [
    AuditService,
    AuditConfigService,
    AuditContextService,
    AuditRepository,
    AuditSubscriber,
    EntityAuditSubscriber,
    {
      provide: 'AUDIT_SUBSCRIBER_INITIALIZER',
      useFactory: (auditContextService: AuditContextService, auditConfigService: AuditConfigService) => {
        AuditSubscriber.configure({ auditContextService, auditConfigService });
        return null;
      },
      inject: [AuditContextService, AuditConfigService],
    },
    {
      provide: 'ENTITY_AUDIT_SUBSCRIBER_INITIALIZER',
      useFactory: (auditContextService: AuditContextService) => {
        EntityAuditSubscriber.configure({ auditContextService });
        return null;
      },
      inject: [AuditContextService],
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditRequestInterceptor,
    },
  ],
  controllers: [AuditController],
  exports: [AuditService, AuditContextService],
})
export class AuditModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuditContextMiddleware).forRoutes('{*splat}');
  }
}
