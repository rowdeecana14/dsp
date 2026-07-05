export const AuditActions = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  FAILED_LOGIN: 'failed_login',
} as const;
export type AuditActionType = (typeof AuditActions)[keyof typeof AuditActions];
