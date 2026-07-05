import { hash } from 'bcrypt';
import { DataSource } from 'typeorm';
import { UserFactory } from '../factories/user.factory';
import { UserEntity } from '../../modules/users/entities/user.entity';
import { RoleEntity } from '../../modules/roles/entities/role.entity';

export class UsersSeeder {
  private readonly usersToSeed = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'change-me-strongly',
      roles: ['admin'],
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Super Admin User',
      email: 'superadmin@example.com',
      password: 'change-me-strongly',
      roles: ['superadmin'],
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Regular User',
      email: 'user@example.com',
      password: 'change-me-strongly',
      roles: [],
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Manager User',
      email: 'manager@example.com',
      password: 'change-me-strongly',
      roles: ['manager'],
    },
  ];

  constructor(private readonly dataSource: DataSource) {}

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(UserEntity);
    const roleRepository = this.dataSource.getRepository(RoleEntity);

    const adminRole = await roleRepository.findOne({ where: { name: 'admin' } });
    const superAdminRole = await roleRepository.findOne({ where: { name: 'superadmin' } });
    const userRole = await roleRepository.findOne({ where: { name: 'user' } });
    const managerRole = await roleRepository.findOne({ where: { name: 'manager' } });

    if (!adminRole || !superAdminRole || !userRole || !managerRole) {
      return;
    }

    const roleMap = {
      admin: adminRole,
      superadmin: superAdminRole,
      user: userRole,
      manager: managerRole,
    };

    for (const userSeed of this.usersToSeed) {
      let user = await repository.findOne({
        where: { email: userSeed.email },
        relations: { roles: true },
      });

      if (!user) {
        const hashedPassword = await hash(userSeed.password, 10);
        const newUser = UserFactory.create(userSeed.id, userSeed.name, userSeed.email, hashedPassword);
        newUser.roles = userSeed.roles.map((roleName) => roleMap[roleName]).filter(Boolean);
        await repository.save(newUser);
        continue;
      }

      const roleNames = user.roles?.map((role) => role.name) ?? [];
      const missingRoles = userSeed.roles
        .map((roleName) => roleMap[roleName])
        .filter((role) => role && !roleNames.includes(role.name));
      
      if (missingRoles.length) {
        user.roles = [...(user.roles ?? []), ...missingRoles];
        await repository.save(user);
      }
    }
  }
}
