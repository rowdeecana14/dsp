import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogsTable1751664200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id CHAR(36) NOT NULL,
        user_id CHAR(36) NULL,
        user_name VARCHAR(128) NULL,
        action VARCHAR(64) NOT NULL,
        module VARCHAR(128) NOT NULL,
        entity_name VARCHAR(128) NOT NULL,
        entity_id VARCHAR(128) NULL,
        old_values JSON NULL,
        new_values JSON NULL,
        metadata JSON NULL,
        ip_address VARCHAR(64) NULL,
        user_agent VARCHAR(255) NULL,
        http_method VARCHAR(16) NULL,
        endpoint VARCHAR(255) NULL,
        request_id VARCHAR(64) NULL,
        status_code INT NULL,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        INDEX IDX_AUDIT_LOGS_USER_ID (user_id),
        INDEX IDX_AUDIT_LOGS_ENTITY (entity_name, entity_id),
        INDEX IDX_AUDIT_LOGS_ACTION (action),
        INDEX IDX_AUDIT_LOGS_MODULE (module),
        INDEX IDX_AUDIT_LOGS_REQUEST_ID (request_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs`);
  }
}
