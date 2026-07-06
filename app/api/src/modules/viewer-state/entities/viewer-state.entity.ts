import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'viewer_state' })
export class ViewerStateEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'varchar', length: 128 })
  user_id!: string;

  @Column({ name: 'study_instance_uid', type: 'varchar', length: 128 })
  study_instance_uid!: string;

  @Column({ type: 'varchar', length: 64 })
  mode!: string;

  @Column({ type: 'varchar', length: 64 })
  theme!: string;

  @Column({ name: 'selected_tooth', type: 'varchar', length: 32 })
  selected_tooth!: string;

  @Column({ name: 'tooth_system', type: 'varchar', length: 16 })
  tooth_system!: string;

  @Column({ name: 'viewport_layout', type: 'varchar', length: 64 })
  viewport_layout!: string;

  @Column({ name: 'patient_id', type: 'varchar', length: 128, nullable: true })
  patient_id?: string | null;

  @Column({ name: 'viewport_config', type: 'json', nullable: true })
  viewport_config?: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  created_at!: Date;

  @Column({ name: 'created_by', type: 'varchar', length: 128, nullable: true })
  created_by?: string | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updated_at!: Date;

  @Column({ name: 'updated_by', type: 'varchar', length: 128, nullable: true })
  updated_by?: string | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deleted_at?: Date | null;

  @Column({ name: 'deleted_by', type: 'varchar', length: 128, nullable: true })
  deleted_by?: string | null;
}
