export interface AuditPayloadDto {
  action: string;
  module: string;
  entityName: string;
  entityId?: string;
  oldValues?: Record<string, any> | null | undefined;
  newValues?: Record<string, any> | null | undefined;
  metadata?: Record<string, any>;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  httpMethod?: string;
  endpoint?: string;
  requestId?: string;
  statusCode?: number;
}
