import { RoleEntity } from '../../modules/roles/entities/role.entity';
import { PermissionEntity } from '../../modules/permissions/entities/permission.entity';

export class RoleFactory {
  public static create(
    name: string,
    displayName?: string,
    permissions: PermissionEntity[] = [],
  ): RoleEntity {
    const role = new RoleEntity();
    role.name = name;
    role.display_name = displayName;
    role.permissions = permissions;
    return role;
  }
}
