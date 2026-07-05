import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dataSource from './data-source';

@Injectable()
export class MigrationService {
  constructor(private readonly configService: ConfigService) {}

  public async runMigrations(): Promise<void> {
    const ds = dataSource.isInitialized ? dataSource : await dataSource.initialize();
    try {
      console.log('Running migrations...');
      await ds.runMigrations();
      console.log('Migrations completed successfully');
    } finally {
      if (ds.isInitialized) {
        await ds.destroy();
      }
    }
  }

  public async rollbackLastMigration(): Promise<void> {
    const ds = dataSource.isInitialized ? dataSource : await dataSource.initialize();
    try {
      console.log('Rolling back last migration...');
      await ds.undoLastMigration();
      console.log('Migration rollback completed successfully');
    } finally {
      if (ds.isInitialized) {
        await ds.destroy();
      }
    }
  }

  public async showMigrationStatus(): Promise<void> {
    const ds = dataSource.isInitialized ? dataSource : await dataSource.initialize();
    try {
      console.log('Migration status:');
      const tableName = this.configService.get<string>('DB_MIGRATION_TABLE', 'migrations');
      const executedMigrations = await ds.query(`SELECT * FROM ${tableName} ORDER BY id ASC`);
      if (executedMigrations.length === 0) {
        console.log('No migrations have been executed');
      } else {
        executedMigrations.forEach((migration: { name: string; timestamp: string }) => {
          console.log(`${migration.name}: Executed at ${migration.timestamp}`);
        });
      }
    } finally {
      if (ds.isInitialized) {
        await ds.destroy();
      }
    }
  }
}
