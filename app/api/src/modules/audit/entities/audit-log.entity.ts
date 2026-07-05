import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'audit_logs' })
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'char', length: 36, nullable: true })
  user_id?: string;

  @Column({ name: 'user_name', type: 'varchar', length: 128, nullable: true })
  user_name?: string;

  @Column({ name: 'action', type: 'varchar', length: 64 })
  action!: string;

  @Column({ name: 'module', type: 'varchar', length: 128 })
  module!: string;

  @Column({ name: 'entity_name', type: 'varchar', length: 128 })
  entity_name!: string;

  @Column({ name: 'entity_id', type: 'varchar', length: 128, nullable: true })
  entity_id?: string;

  @Column({ name: 'old_values', type: 'json', nullable: true })
  old_values?: Record<string, any>;

  @Column({ name: 'new_values', type: 'json', nullable: true })
  new_values?: Record<string, any>;

  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true })
  ip_address?: string;

  @Column({ name: 'user_agent', type: 'varchar', length: 255, nullable: true })
  user_agent?: string;

  @Column({ name: 'http_method', type: 'varchar', length: 16, nullable: true })
  http_method?: string;

  @Column({ name: 'endpoint', type: 'varchar', length: 255, nullable: true })
  endpoint?: string;

  @Column({ name: 'request_id', type: 'varchar', length: 64, nullable: true })
  request_id?: string;

  @Column({ name: 'status_code', type: 'int', nullable: true })
  status_code?: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  created_at!: Date;
}
