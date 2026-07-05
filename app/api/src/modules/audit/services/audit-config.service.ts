import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_AUDIT_CONFIG } from '../audit.constants';

@Injectable()
export class AuditConfigService {
  constructor(private readonly configService: ConfigService) {}

  private parseStringArray(value: string | string[] | undefined, fallback: string[]): string[] {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value !== 'string' || value.trim().length === 0) {
      return fallback;
    }
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  getIgnoredEntities(): string[] {
    const value = this.configService.get<string | string[]>('AUDIT_IGNORED_ENTITIES');
    return this.parseStringArray(value, DEFAULT_AUDIT_CONFIG.ignoredEntities);
  }

  getIgnoredActions(): string[] {
    const value = this.configService.get<string | string[]>('AUDIT_IGNORED_ACTIONS');
    return this.parseStringArray(value, DEFAULT_AUDIT_CONFIG.ignoredActions);
  }

  getExcludedFields(): string[] {
    const value = this.configService.get<string | string[]>('AUDIT_EXCLUDED_FIELDS');
    return this.parseStringArray(value, DEFAULT_AUDIT_CONFIG.excludedFields);
  }

  getMaxPayloadSize(): number {
    return this.configService.get<number>('AUDIT_MAX_PAYLOAD_SIZE', DEFAULT_AUDIT_CONFIG.maxPayloadSize);
  }
}
