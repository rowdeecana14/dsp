import { DeepPartial, EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent } from 'typeorm';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { AuditActions } from '../events/audit-events';
import { AuditContextService } from '../services/audit-context.service';
import { AuditConfigService } from '../services/audit-config.service';

type AuditEvent = InsertEvent<any> | UpdateEvent<any> | RemoveEvent<any>;

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<any> {
  private static auditContextService?: AuditContextService;
  private static auditConfigService?: AuditConfigService;

  static configure(options: {
    auditContextService: AuditContextService;
    auditConfigService: AuditConfigService;
  }) {
    AuditSubscriber.auditContextService = options.auditContextService;
    AuditSubscriber.auditConfigService = options.auditConfigService;
  }

  private getContext() {
    return AuditSubscriber.auditContextService?.getContext();
  }

  private getIgnoredEntities(): string[] {
    return AuditSubscriber.auditConfigService?.getIgnoredEntities() ?? ['AuditLog'];
  }

  private shouldAudit(metadata: { name?: string; tableName?: string }): boolean {
    const entityName = metadata.name;
    if (!entityName) {
      return false;
    }

    if (this.getIgnoredEntities().includes(entityName)) {
      return false;
    }

    const tableName = metadata.tableName?.toLowerCase() ?? '';
    return !tableName.includes('audit') && !tableName.includes('user_roles') && !tableName.includes('user_permissions') && !tableName.includes('role_permissions');
  }

  private getEntityId(event: AuditEvent): string | undefined {
    const primaryColumns = event.metadata.primaryColumns;
    if (!primaryColumns?.length) return undefined;

    const typedEvent = event as any;
    const databaseEntity = typedEvent.databaseEntity as any;

    if (primaryColumns.length === 1) {
      const propertyName = primaryColumns[0].propertyName;
      return String(typedEvent.entity?.[propertyName] ?? databaseEntity?.[propertyName] ?? '');
    }

    return primaryColumns
      .map((column) => `${column.propertyName}:${String(typedEvent.entity?.[column.propertyName] ?? databaseEntity?.[column.propertyName] ?? '')}`)
      .join(',');
  }

  private snapshotEntity(entity: any, metadata: { columns: Array<{ propertyName: string }> }): Record<string, any> | undefined {
    if (!entity) return undefined;

    return metadata.columns.reduce((payload, column) => {
      payload[column.propertyName] = entity[column.propertyName];
      return payload;
    }, {} as Record<string, any>);
  }

  private buildBasePayload(payload: Partial<AuditLogEntity>): Partial<AuditLogEntity> {
    const context = this.getContext();
    return {
      ...payload,
      user_id: payload.user_id ?? context?.userId,
      user_name: payload.user_name ?? context?.userName,
      ip_address: payload.ip_address ?? context?.ipAddress,
      user_agent: payload.user_agent ?? context?.userAgent,
      http_method: payload.http_method ?? context?.httpMethod,
      endpoint: payload.endpoint ?? context?.endpoint,
      request_id: payload.request_id ?? context?.requestId,
      status_code: payload.status_code ?? context?.statusCode,
    };
  }

  private async createAuditLog(event: AuditEvent, action: string, oldValues?: Record<string, any>, newValues?: Record<string, any>) {
    if (!this.shouldAudit(event.metadata)) {
      return;
    }

    const entityName = this.normalizeEntityName(event.metadata.name);
    const moduleName = this.normalizeEntityName(event.metadata.tableName || entityName);
    const entityId = this.getEntityId(event);

    const auditRecord: Partial<AuditLogEntity> = this.buildBasePayload({
      action,
      module: moduleName,
      entity_name: entityName,
      entity_id: entityId,
      old_values: oldValues,
      new_values: newValues,
      metadata: event.queryRunner?.connection?.options
        ? { database: event.queryRunner.connection.options.database }
        : undefined,
    });

    const repository = event.manager.getRepository(AuditLogEntity);
    const record = repository.create(auditRecord as any) as DeepPartial<AuditLogEntity>;
    await repository.save(record as AuditLogEntity);
  }

  private normalizeEntityName(name?: string): string | undefined {
    if (!name) {
      return undefined;
    }

    const withoutSuffix = name.replace(/Entity$/i, '');
    const normalized = withoutSuffix
      .replace(/user_roles?/i, 'User')
      .replace(/role_permissions?/i, 'Role')
      .replace(/permission(s)?/i, 'Permission')
      .replace(/[_-]+/g, ' ')
      .trim();

    if (!normalized) {
      return undefined;
    }

    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  async afterInsert(event: InsertEvent<any>): Promise<void> {
    await this.createAuditLog(event, AuditActions.CREATE, undefined, this.snapshotEntity(event.entity, event.metadata));
  }

  async afterUpdate(event: UpdateEvent<any>): Promise<void> {
    await this.createAuditLog(event, AuditActions.UPDATE, this.snapshotEntity(event.databaseEntity, event.metadata), this.snapshotEntity(event.entity, event.metadata));
  }

  async afterRemove(event: RemoveEvent<any>): Promise<void> {
    const typedEvent = event as any;
    const entity = typedEvent.databaseEntity ?? typedEvent.entity;
    await this.createAuditLog(event, AuditActions.DELETE, this.snapshotEntity(entity, event.metadata), undefined);
  }
}
