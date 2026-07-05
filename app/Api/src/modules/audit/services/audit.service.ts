import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { AuditPayloadDto } from '../dto/audit-payload.dto';
import { AuditContextService } from './audit-context.service';
import { AuditRepository } from '../repositories/audit.repository';
import { AuditConfigService } from './audit-config.service';
import { AuditActions } from '../events/audit-events';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditRepository: Repository<AuditLogEntity>,
    private readonly auditContext: AuditContextService,
    private readonly auditConfig: AuditConfigService,
    private readonly auditRepositoryService: AuditRepository,
  ) {}

  private sanitizeValues(values?: Record<string, any> | null): Record<string, any> | undefined {
    if (!values) return undefined;

    const excludedFields = this.auditConfig.getExcludedFields();
    const maskRecursive = (obj: any): any => {
      if (obj === null || obj === undefined) return obj;
      if (Array.isArray(obj)) return obj.map((item) => maskRecursive(item));
      if (typeof obj !== 'object') return obj;

      return Object.keys(obj).reduce((result, key) => {
        if (excludedFields.includes(key)) {
          result[key] = '[REDACTED]';
        } else {
          result[key] = maskRecursive(obj[key]);
        }
        return result;
      }, {} as Record<string, any>);
    };

    const sanitized = maskRecursive(values);
    const payloadString = JSON.stringify(sanitized);
    const maxSize = this.auditConfig.getMaxPayloadSize();

    if (payloadString.length <= maxSize) {
      return sanitized;
    }

    return {
      __audit_payload_truncated__: true,
      payloadSize: payloadString.length,
      payloadType: typeof sanitized,
    };
  }

  private buildBasePayload(payload: AuditPayloadDto): AuditPayloadDto {
    const context = this.auditContext.getContext();
    return {
      ...payload,
      oldValues: this.sanitizeValues(payload.oldValues),
      newValues: this.sanitizeValues(payload.newValues),
      metadata: payload.metadata,
      userId: payload.userId ?? context?.userId,
      userName: payload.userName ?? context?.userName,
      ipAddress: payload.ipAddress ?? context?.ipAddress,
      userAgent: payload.userAgent ?? context?.userAgent,
      httpMethod: payload.httpMethod ?? context?.httpMethod,
      endpoint: payload.endpoint ?? context?.endpoint,
      requestId: payload.requestId ?? context?.requestId,
      statusCode: payload.statusCode ?? context?.statusCode,
    };
  }

  async log(payload: AuditPayloadDto): Promise<AuditLogEntity> {
    const basePayload = this.buildBasePayload(payload);
    const record = this.auditRepository.create({
      action: basePayload.action,
      module: basePayload.module,
      entity_name: basePayload.entityName,
      entity_id: basePayload.entityId,
      old_values: basePayload.oldValues,
      new_values: basePayload.newValues,
      metadata: basePayload.metadata,
      user_id: basePayload.userId,
      user_name: basePayload.userName,
      ip_address: basePayload.ipAddress,
      user_agent: basePayload.userAgent,
      http_method: basePayload.httpMethod,
      endpoint: basePayload.endpoint,
      request_id: basePayload.requestId,
      status_code: basePayload.statusCode,
    } as DeepPartial<AuditLogEntity>);
    return this.auditRepository.save(record as AuditLogEntity);
  }

  async logCreate(payload: AuditPayloadDto): Promise<AuditLogEntity> {
    return this.log({ ...payload, action: AuditActions.CREATE });
  }

  async logUpdate(payload: AuditPayloadDto): Promise<AuditLogEntity> {
    return this.log({ ...payload, action: AuditActions.UPDATE });
  }

  async logDelete(payload: AuditPayloadDto): Promise<AuditLogEntity> {
    return this.log({ ...payload, action: AuditActions.DELETE });
  }

  async logLogin(payload: AuditPayloadDto): Promise<AuditLogEntity> {
    return this.log({ ...payload, action: AuditActions.LOGIN });
  }

  async logLogout(payload: AuditPayloadDto): Promise<AuditLogEntity> {
    return this.log({ ...payload, action: AuditActions.LOGOUT });
  }

  async logFailedLogin(payload: AuditPayloadDto): Promise<AuditLogEntity> {
    return this.log({ ...payload, action: AuditActions.FAILED_LOGIN });
  }

  async findById(id: string): Promise<AuditLogEntity | null> {
    return this.auditRepository.findOne({ where: { id } });
  }

  async findByUser(userId: string): Promise<AuditLogEntity[]> {
    return this.auditRepository.find({ where: { user_id: userId }, order: { created_at: 'DESC' } });
  }

  async findByEntity(entityName: string, entityId: string): Promise<AuditLogEntity[]> {
    return this.auditRepository.find({ where: { entity_name: entityName, entity_id: entityId }, order: { created_at: 'DESC' } });
  }

  async search(query: any): Promise<{ data: AuditLogEntity[]; total: number }> {
    return this.auditRepositoryService.search(query as any);
  }
}
