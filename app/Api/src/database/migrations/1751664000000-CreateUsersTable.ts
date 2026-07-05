import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1751664000000 implements MigrationInterface {
  name = 'CreateUsersTable1751664000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) NOT NULL,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        created_by VARCHAR(128) NULL,
        updated_at DATETIME(6) NULL,
        updated_by VARCHAR(128) NULL,
        deleted_at DATETIME(6) NULL,
        deleted_by VARCHAR(128) NULL,
        PRIMARY KEY (id),
        UNIQUE KEY UQ_USERS_EMAIL (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
  }
}
