import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
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

  toJSON() {
    const {
      created_at,
      created_by,
      updated_at,
      updated_by,
      deleted_at,
      deleted_by,
      ...rest
    } = this as Record<string, unknown>;

    return {
      ...rest,
      created_at,
      created_by,
      updated_at,
      updated_by,
      deleted_at,
      deleted_by,
    };
  }
}

export default BaseEntity;
