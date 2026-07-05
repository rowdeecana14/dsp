import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RoleEntity } from '../entities/role.entity';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async getPermissionsForRoles(roleNames: string[] = []): Promise<string[]> {
    if (!roleNames?.length) {
      return [];
    }

    const roles = await this.roleRepository.find({
      where: { name: In(roleNames) },
      relations: { permissions: true },
    });

    return [...new Set(roles.flatMap((role) => role.permissions?.map((permission) => permission.name) ?? []))];
  }

  private normalizeNames(values: Array<string | null | undefined> = []): string[] {
    return values.map((value) => value?.trim().toLowerCase()).filter(Boolean) as string[];
  }

  hasRole(userRoles: string[] = [], requiredRoles: string[]): boolean {
    const normalizedUserRoles = this.normalizeNames(userRoles);
    const normalizedRequiredRoles = this.normalizeNames(requiredRoles);

    if (normalizedUserRoles.includes('superadmin')) {
      return true;
    }

    return normalizedRequiredRoles.some((role) => normalizedUserRoles.includes(role));
  }

  async hasPermission(
    userRoles: string[] = [],
    userPermissions: string[] = [],
    requiredPermission: string,
  ): Promise<boolean> {
    const normalizedRequiredPermission = requiredPermission?.trim().toLowerCase();
    const normalizedUserPermissions = this.normalizeNames(userPermissions);

    if (normalizedUserPermissions.includes(normalizedRequiredPermission)) {
      return true;
    }

    const normalizedUserRoles = this.normalizeNames(userRoles);
    if (normalizedUserRoles.includes('superadmin')) {
      return true;
    }

    const rolePermissions = await this.getPermissionsForRoles(normalizedUserRoles);
    return rolePermissions.includes(normalizedRequiredPermission);
  }
}
