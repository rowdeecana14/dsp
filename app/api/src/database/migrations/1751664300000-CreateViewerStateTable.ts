import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateViewerStateTable1751664300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS viewer_state (
        id CHAR(36) NOT NULL,
        user_id VARCHAR(128) NOT NULL,
        study_instance_uid VARCHAR(128) NOT NULL,
        mode VARCHAR(64) NOT NULL,
        theme VARCHAR(64) NOT NULL,
        selected_tooth VARCHAR(32) NOT NULL,
        tooth_system VARCHAR(16) NOT NULL,
        viewport_layout VARCHAR(64) NOT NULL,
        measurements JSON NULL,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        created_by VARCHAR(128) NULL,
        updated_at DATETIME(6) NULL,
        updated_by VARCHAR(128) NULL,
        deleted_at DATETIME(6) NULL,
        deleted_by VARCHAR(128) NULL,
        PRIMARY KEY (id),
        INDEX IDX_VIEWER_STATE_USER_STUDY (user_id, study_instance_uid)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS viewer_state`);
  }
}
