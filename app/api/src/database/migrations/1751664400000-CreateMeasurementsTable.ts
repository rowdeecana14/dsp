import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMeasurementsTable1751664400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS measurements (
        id CHAR(36) NOT NULL,
        study_instance_uid VARCHAR(128) NOT NULL,
        user_id VARCHAR(128) NOT NULL,
        label VARCHAR(128) NOT NULL,
        value VARCHAR(128) NOT NULL,
        unit VARCHAR(64) NOT NULL,
        tool VARCHAR(128) NOT NULL,
        captured_at VARCHAR(64) NOT NULL,
        coordinates JSON NULL,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        created_by VARCHAR(128) NULL,
        updated_at DATETIME(6) NULL,
        updated_by VARCHAR(128) NULL,
        deleted_at DATETIME(6) NULL,
        deleted_by VARCHAR(128) NULL,
        PRIMARY KEY (id),
        INDEX IDX_MEASUREMENTS_STUDY_USER (study_instance_uid, user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS measurements`);
  }
}
