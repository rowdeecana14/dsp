import { BadRequestException, ForbiddenException, Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';
import { In, Repository } from 'typeorm';
import { PermissionEntity } from '../../permissions/entities/permission.entity';
import { RoleEntity } from '../../roles/entities/role.entity';
import { UserEntity } from '../entities/user.entity';

export interface User {
  id: string;
  email: string;
  name: string;
  roles?: string[];
  permissions?: string[];
  password?: string;
}

@Injectable()
export class UserService {
  private readonly protectedRoleNames = new Set(['superadmin']);
  private readonly bcryptRounds: number;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    const rounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
    this.bcryptRounds = typeof rounds === 'number' ? rounds : parseInt(String(rounds), 10) || 12;
  }

  private isProtectedRole(role?: Partial<RoleEntity> | null): boolean {
    return !!role?.name && this.protectedRoleNames.has(role.name.trim().toLowerCase());
  }

  private filterProtectedRoles(roles?: RoleEntity[]): RoleEntity[] {
    return (roles ?? []).filter((role) => !this.isProtectedRole(role));
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private async comparePassword(inputPassword: string, storedPassword: string): Promise<boolean> {
    if (!inputPassword || !storedPassword) {
      return false;
    }

    return compare(inputPassword, storedPassword);
  }

  async authenticate(email: string, password: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({
      where: { email: this.normalizeEmail(email) },
      relations: {
        roles: { permissions: true },
        permissions: true,
      },
    });

    if (!user || !(await this.comparePassword(password, user.password))) {
      return null;
    }

    return user;
  }

  async getUserById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: {
        roles: { permissions: true },
        permissions: true,
      },
    });
  }

  async getUserByIdWithRelations(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: {
        roles: { permissions: true },
        permissions: true,
      },
    });
  }

  sanitizeUser(user: UserEntity | null): Omit<UserEntity, 'password'> | null {
    if (!user) {
      return null;
    }

    const { password, ...safeUser } = user as UserEntity & Record<string, any>;

    safeUser.roles = this.filterProtectedRoles(user.roles) as typeof safeUser.roles;

    const { created_at, created_by, updated_at, updated_by, deleted_at, deleted_by, ...rest } = safeUser;

    return {
      ...rest,
      created_at,
      created_by,
      updated_at,
      updated_by,
      deleted_at,
      deleted_by,
    } as Omit<UserEntity, 'password'>;
  }

  async getUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email: this.normalizeEmail(email) },
      relations: {
        roles: { permissions: true },
        permissions: true,
      },
    });
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.userRepository.find({ relations: { roles: { permissions: true }, permissions: true } });
    return users.map((user) => {
      user.roles = this.filterProtectedRoles(user.roles);
      return user;
    });
  }

  private async resolveRoles(roleNames: string[]): Promise<RoleEntity[]> {
    if (!roleNames?.length) {
      return [];
    }

    const normalizedNames = roleNames.map((name) => name.trim().toLowerCase()).filter(Boolean);
    const existingRoles = await this.roleRepository.find({
      where: { name: In(normalizedNames) },
      relations: { permissions: true },
    });

    const existingNames = new Set(existingRoles.map((role) => role.name));
    const missingNames = normalizedNames.filter((name) => !existingNames.has(name));

    const createdRoles = missingNames.map((name) => this.roleRepository.create({ name }));

    return [...existingRoles, ...(await this.roleRepository.save(createdRoles))];
  }

  private async resolvePermissions(permissionNames: string[]): Promise<PermissionEntity[]> {
    if (!permissionNames?.length) {
      return [];
    }

    const existingPermissions = await this.permissionRepository.find({
      where: { name: In(permissionNames) },
    });

    const existingNames = new Set(existingPermissions.map((permission) => permission.name));
    const missingNames = permissionNames.filter((name) => !existingNames.has(name));

    const createdPermissions = missingNames.map((name) => this.permissionRepository.create({ name }));

    return [...existingPermissions, ...(await this.permissionRepository.save(createdPermissions))];
  }

  async addUser(
    email: string,
    name: string,
    password: string = 'password',
    roles: string[] = ['user'],
    permissions: string[] = [],
    id?: string,
  ): Promise<UserEntity> {
    const normalizedEmail = this.normalizeEmail(email);
    const existingUser = await this.userRepository.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const userRoles = await this.resolveRoles(roles);
    const userPermissions = await this.resolvePermissions(permissions);
    const hashedPassword = await hash(password, this.bcryptRounds);

    const user = this.userRepository.create({
      id,
      email: normalizedEmail,
      name,
      password: hashedPassword,
      roles: userRoles,
      permissions: userPermissions,
    });

    const created = await this.userRepository.save(user);
    return created;
  }

  async updateUser(
    id: string,
    updates: Partial<Pick<User, 'email' | 'name' | 'password' | 'roles' | 'permissions'>>,
  ): Promise<UserEntity | null> {
    const user = await this.getUserById(id);
    if (!user) {
      return null;
    }

    if (updates.email !== undefined) {
      const normalizedEmail = this.normalizeEmail(updates.email);
      const currentEmail = user.email.trim().toLowerCase();
      if (normalizedEmail !== currentEmail) {
        const existingUser = await this.userRepository.findOne({ where: { email: normalizedEmail } });
        if (existingUser && existingUser.id !== user.id) {
          throw new BadRequestException('Email already exists');
        }
      }
      user.email = normalizedEmail;
    }

    if (updates.name !== undefined) {
      user.name = updates.name;
    }
    if (updates.password !== undefined) {
      user.password = await hash(updates.password, this.bcryptRounds);
    }
    if (updates.roles !== undefined) {
      user.roles = await this.resolveRoles(updates.roles ?? []);
    }
    if (updates.permissions !== undefined) {
      user.permissions = await this.resolvePermissions(updates.permissions ?? []);
    }

    const updated = await this.userRepository.save(user);
    return updated;
  }

  async assignRole(userId: string, roleName: string): Promise<UserEntity> {
    const user = await this.getUserById(userId);
    if (!user) throw new Error('User not found');
    const roles = await this.resolveRoles([roleName]);
    user.roles = [...(user.roles ?? []), ...roles.filter((r) => !(user.roles ?? []).some((ur) => ur.id === r.id))];
    return this.userRepository.save(user);
  }

  async removeRole(userId: string, roleName: string): Promise<UserEntity> {
    const user = await this.getUserById(userId);
    if (!user) throw new Error('User not found');
    user.roles = (user.roles ?? []).filter((r) => r.name !== roleName);
    return this.userRepository.save(user);
  }

  async assignPermission(userId: string, permissionName: string): Promise<UserEntity> {
    const user = await this.getUserById(userId);
    if (!user) throw new Error('User not found');
    const perms = await this.resolvePermissions([permissionName]);
    user.permissions = [...(user.permissions ?? []), ...perms.filter((p) => !(user.permissions ?? []).some((up) => up.id === p.id))];
    return this.userRepository.save(user);
  }

  async removePermission(userId: string, permissionName: string): Promise<UserEntity> {
    const user = await this.getUserById(userId);
    if (!user) throw new Error('User not found');
    user.permissions = (user.permissions ?? []).filter((p) => p.name !== permissionName);
    return this.userRepository.save(user);
  }

  async getEffectivePermissions(userId: string): Promise<string[]> {
    const user = await this.getUserById(userId);
    if (!user) return [];

    const rolePerms = user.roles?.flatMap((r) => r.permissions?.map((p) => p.name) ?? []) ?? [];
    const directPerms = user.permissions?.map((p) => p.name) ?? [];
    return [...new Set([...rolePerms, ...directPerms])];
  }

  async remove(id: string): Promise<UserEntity> {
    const user = await this.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if ((user.roles ?? []).some((role) => this.isProtectedRole(role))) {
      throw new ForbiddenException('This user is protected and cannot be deleted.');
    }

    return this.userRepository.softRemove(user);
  }
}
