import { Injectable } from '@nestjs/common';
import dataSource from './data-source';
import { RbacSeeder } from '../../database/seeds/rbac.seed';
import { UsersSeeder } from '../../database/seeds/users.seed';

@Injectable()
export class SeederService {
  public async runSeeders(): Promise<void> {
    const ds = dataSource.isInitialized ? dataSource : await dataSource.initialize();
    try {
      console.log('Running seeders...');

      const rbacSeeder = new RbacSeeder(ds);
      await rbacSeeder.run();
      console.log('RBAC seeder completed');

      const usersSeeder = new UsersSeeder(ds);
      await usersSeeder.run();
      console.log('Users seeder completed');

      console.log('All seeders completed successfully');
    } finally {
      if (ds.isInitialized) {
        await ds.destroy();
      }
    }
  }

  public async runSeeder(seederName: string): Promise<void> {
    const ds = dataSource.isInitialized ? dataSource : await dataSource.initialize();
    try {
      console.log(`Running seeder: ${seederName}...`);

      switch (seederName.toLowerCase()) {
        case 'rbac':
          await new RbacSeeder(ds).run();
          console.log('RBAC seeder completed');
          break;
        case 'users':
          await new UsersSeeder(ds).run();
          console.log('Users seeder completed');
          break;
        default:
          throw new Error(`Unknown seeder: ${seederName}`);
      }
    } finally {
      if (ds.isInitialized) {
        await ds.destroy();
      }
    }
  }
}
