#!/usr/bin/env ts-node
import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { configuration, validationSchema } from '../config/configuration';
import { MigrationService } from './migration.service';
import { SeederService } from './seeder.service';

const command = process.argv[2];
const argument = process.argv[3];

async function main() {
  // Initialize ConfigService
  const config = new ConfigService({
    ...configuration(),
    ...process.env,
  });

  // Validate config (plain env object — ConfigService instance is not a Zod input)
  const envConfig = { ...configuration(), ...process.env };
  try {
    validationSchema.parse(envConfig);
  } catch (error) {
    console.error('❌ Configuration validation failed:');
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }

  const migrationService = new MigrationService(config);
  const seederService = new SeederService();

  try {
    switch (command) {
      case 'migrate':
        await migrationService.runMigrations();
        break;
      case 'migrate:rollback':
        await migrationService.rollbackLastMigration();
        break;
      case 'migrate:status':
        await migrationService.showMigrationStatus();
        break;
      case 'db:seed':
        if (argument) {
          await seederService.runSeeder(argument);
        } else {
          await seederService.runSeeders();
        }
        break;
      default:
        console.log('Available commands:');
        console.log('  migrate           - Run pending migrations');
        console.log('  migrate:rollback  - Rollback last migration');
        console.log('  migrate:status   - Show migration status');
        console.log('  db:seed           - Run all seeders');
        console.log('  db:seed [name]    - Run specific seeder');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error executing command:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error instanceof Error ? error.message : error);
  process.exit(1);
});
