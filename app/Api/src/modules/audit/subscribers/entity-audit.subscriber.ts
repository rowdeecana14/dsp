import { EntitySubscriberInterface, EventSubscriber, InsertEvent, SoftRemoveEvent, UpdateEvent } from 'typeorm';
import { AuditContextService } from '../services/audit-context.service';

type AuditedEntity = {
  created_by?: string | null;
  updated_by?: string | null;
  deleted_by?: string | null;
};

@EventSubscriber()
export class EntityAuditSubscriber implements EntitySubscriberInterface<any> {
  private static auditContextService?: AuditContextService;

  private readonly auditedTables = new Set([
    'users',
    'roles',
    'permissions',
    'measurements',
    'viewer_state',
  ]);

  static configure(options: { auditContextService: AuditContextService }) {
    EntityAuditSubscriber.auditContextService = options.auditContextService;
  }

  private getUserId(): string {
    return EntityAuditSubscriber.auditContextService?.getContext()?.userId ?? 'system';
  }

  private shouldAudit(tableName?: string): boolean {
    return !!tableName && this.auditedTables.has(tableName.toLowerCase());
  }

  private touchCreatedFields(entity: AuditedEntity) {
    const userId = this.getUserId();
    entity.created_by = entity.created_by ?? userId;
    entity.updated_by = userId;
  }

  private touchUpdatedFields(entity: AuditedEntity) {
    entity.updated_by = this.getUserId();
  }

  private touchDeletedFields(entity: AuditedEntity) {
    entity.deleted_by = this.getUserId();
  }

  async beforeInsert(event: InsertEvent<any>): Promise<void> {
    if (!this.shouldAudit(event.metadata.tableName)) {
      return;
    }

    this.touchCreatedFields(event.entity as AuditedEntity);
  }

  async beforeUpdate(event: UpdateEvent<any>): Promise<void> {
    if (!this.shouldAudit(event.metadata.tableName) || !event.entity) {
      return;
    }

    this.touchUpdatedFields(event.entity as AuditedEntity);
  }

  async beforeSoftRemove(event: SoftRemoveEvent<any>): Promise<void> {
    if (!this.shouldAudit(event.metadata.tableName) || !event.entity) {
      return;
    }

    this.touchDeletedFields(event.entity as AuditedEntity);
  }
}
