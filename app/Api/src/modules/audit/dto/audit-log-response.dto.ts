import { AuditLogEntity } from '../entities/audit-log.entity';

export class AuditLogResponseDto {
  id!: string;
  user_id?: string;
  user_name?: string;
  action!: string;
  module!: string;
  entity_name!: string;
  entity_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  http_method?: string;
  endpoint?: string;
  request_id?: string;
  status_code?: number;
  created_at!: Date;

  constructor(entity: AuditLogEntity) {
    Object.assign(this, entity);
  }
}
