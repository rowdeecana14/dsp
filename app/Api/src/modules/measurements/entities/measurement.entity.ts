import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'measurements' })
export class MeasurementEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'study_instance_uid', type: 'varchar', length: 128 })
  study_instance_uid!: string;

  @Column({ name: 'user_id', type: 'varchar', length: 128 })
  user_id!: string;

  @Column({ type: 'varchar', length: 128 })
  label!: string;

  @Column({ type: 'varchar', length: 128 })
  value!: string;

  @Column({ type: 'varchar', length: 64 })
  unit!: string;

  @Column({ type: 'varchar', length: 128 })
  tool!: string;

  @Column({ name: 'captured_at', type: 'varchar', length: 64 })
  captured_at!: string;

  @Column({ type: 'json', nullable: true })
  coordinates?: any;

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
