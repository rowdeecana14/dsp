import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RoleEntity } from './entities/role.entity';
import { PermissionEntity } from '../permissions/entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  private readonly protectedRoleNames = new Set(['superadmin']);
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepo: Repository<PermissionEntity>,
  ) {}

  private isProtectedRole(role?: Partial<RoleEntity> | null): boolean {
    return !!role?.name && this.protectedRoleNames.has(role.name.trim().toLowerCase());
  }

  async create(dto: CreateRoleDto) {
    const name = dto.name.trim().toLowerCase();
   
    if (this.isProtectedRole({ name: name })) {
      throw new ForbiddenException('This role is protected and cannot be modified.');
    }

    const existing = await this.roleRepo.findOne({ where: { name: name } });
    if (existing) {
      throw new BadRequestException('Role name already exists');
    }

    const role = this.roleRepo.create({ name: name, display_name: dto.display_name });
    if (dto.permissions?.length) {
      const perms = await this.permissionRepo.find({ where: { name: In(dto.permissions) } });
      role.permissions = perms;
    }
    return this.roleRepo.save(role);
  }

  async findAll(): Promise<RoleEntity[]> {
    const roles = await this.roleRepo.find({ relations: { permissions: true } });
    return roles.filter((role) => !this.isProtectedRole(role));
  }

  async findOne(id: string): Promise<RoleEntity> {
    const r = await this.roleRepo.findOne({ where: { id }, relations: { permissions: true } });
    if (!r) throw new NotFoundException('Role not found');
    return r;
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.findOne(id);
    if (this.isProtectedRole(role)) {
      throw new ForbiddenException('This role is protected and cannot be updated.');
    }

    if (dto.name) {
      const name = dto.name.trim().toLowerCase();
      if (name !== role.name) {
        const existing = await this.roleRepo.findOne({ where: { name: name } });
        if (existing && existing.id !== role.id) {
          throw new BadRequestException('Role name already exists');
        }
      }
      role.name = name;
    }

    if (dto.display_name !== undefined) role.display_name = dto.display_name;
    if (dto.permissions) {
      const perms = await this.permissionRepo.find({ where: { name: In(dto.permissions) } });
      role.permissions = perms;
    }
    return this.roleRepo.save(role);
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    if (this.isProtectedRole(role)) {
      throw new ForbiddenException('This role is protected and cannot be deleted.');
    }
    return this.roleRepo.softRemove(role);
  }
}
