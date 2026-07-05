import { PermissionEntity } from '../../modules/permissions/entities/permission.entity';

export class PermissionFactory {
  public static create(name: string, displayName?: string): PermissionEntity {
    const permission = new PermissionEntity();
    permission.name = name;
    permission.display_name = displayName;
    return permission;
  }
}
