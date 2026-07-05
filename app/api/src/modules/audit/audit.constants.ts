export const AUDIT_REQUEST_CONTEXT_KEY = 'AUDIT_REQUEST_CONTEXT';

export const DEFAULT_AUDIT_CONFIG = {
  ignoredEntities: ['AuditLog', 'AuditLogEntity'],
  ignoredActions: [] as string[],
  excludedFields: ['password', 'refresh_token', 'access_token', 'secret', 'api_key'],
  maxPayloadSize: 1024 * 20, // 20 KB
};

export const AUDIT_EVENT_BASE = 'audit';
export const AUDIT_EVENT_SEPARATOR = '.';

export const AUDIT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  FAILED_LOGIN: 'failed_login',
} as const;
