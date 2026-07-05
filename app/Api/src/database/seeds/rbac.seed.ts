import { DataSource } from 'typeorm';
import { RoleEntity } from '../../modules/roles/entities/role.entity';
import { PermissionEntity } from '../../modules/permissions/entities/permission.entity';
import { PermissionFactory } from '../factories/permission.factory';
import { RoleFactory } from '../factories/role.factory';

export class RbacSeeder {
  private readonly permissionDefinitions = [
    { name: 'users.read', displayName: 'Read Users' },
    { name: 'users.create', displayName: 'Create Users' },
    { name: 'users.update', displayName: 'Update Users' },
    { name: 'users.delete', displayName: 'Delete Users' },
    { name: 'roles.read', displayName: 'Read Roles' },
    { name: 'roles.create', displayName: 'Create Roles' },
    { name: 'roles.update', displayName: 'Update Roles' },
    { name: 'roles.delete', displayName: 'Delete Roles' },
    { name: 'permissions.read', displayName: 'Read Permissions' },
    { name: 'permissions.create', displayName: 'Create Permissions' },
    { name: 'permissions.update', displayName: 'Update Permissions' },
    { name: 'permissions.delete', displayName: 'Delete Permissions' },
  ];

  constructor(private readonly dataSource: DataSource) {}

  public async run(): Promise<void> {
    const permRepo = this.dataSource.getRepository(PermissionEntity);
    const roleRepo = this.dataSource.getRepository(RoleEntity);

    const createdPerms: PermissionEntity[] = [];
    for (const definition of this.permissionDefinitions) {
      let permission = await permRepo.findOne({ where: { name: definition.name } });
      if (!permission) {
        permission = PermissionFactory.create(definition.name, definition.displayName);
        permission = await permRepo.save(permission);
      } else if (!permission.display_name) {
        permission.display_name = definition.displayName;
        permission = await permRepo.save(permission);
      }
      createdPerms.push(permission);
    }

    const roles = [
      { name: 'superadmin', displayName: 'Super Administrator' },
      { name: 'admin', displayName: 'Administrator' },
      { name: 'manager', displayName: 'Manager' },
      { name: 'user', displayName: 'User' },
    ];
    for (const roleDefinition of roles) {
      let role = await roleRepo.findOne({ where: { name: roleDefinition.name } });
      if (!role) {
        role = RoleFactory.create(
          roleDefinition.name,
          roleDefinition.displayName,
          roleDefinition.name === 'superadmin' || roleDefinition.name === 'admin' ? createdPerms : [],
        );
        await roleRepo.save(role);
      } else if (!role.display_name) {
        role.display_name = roleDefinition.displayName;
        await roleRepo.save(role);
      }
    }
  }
}
