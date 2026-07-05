import { z } from 'zod';
import { boolPreprocess, numPreprocess } from '../zod.helpers';

export const auditSchema = z.object({
  AUDIT_MAX_PAYLOAD_SIZE: z.preprocess(
    numPreprocess,
    z.number().int().positive().default(20480),
  ),

  AUDIT_IGNORED_ENTITIES: z.string().default('AuditLog,AuditLogEntity'),

  AUDIT_IGNORED_ACTIONS: z.string().default(''),

  AUDIT_EXCLUDED_FIELDS: z.string().default(
    'password,refresh_token,access_token,secret,api_key,otp,pin',
  ),

  ENABLE_AUDIT_LOGGING: z.preprocess(
    boolPreprocess,
    z.boolean().default(true),
  ),

  ENABLE_AUDIT_REQUEST_METADATA: z.preprocess(
    boolPreprocess,
    z.boolean().default(true),
  ),

  ENABLE_AUDIT_DIFF: z.preprocess(
    boolPreprocess,
    z.boolean().default(true),
  ),
});