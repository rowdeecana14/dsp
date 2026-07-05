import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { UserService } from '../users/services/user.service';
import { AuditActions } from '../audit/events/audit-events';
import { AuditService } from '../audit/services/audit.service';
import { AuditContextService } from '../audit/services/audit-context.service';
import { AuthDto } from './dto/auth.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
    private readonly auditContextService: AuditContextService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthDto> {
    const user = await this.userService.authenticate(loginDto.email, loginDto.password);

    if (!user) {
      await this.auditService.logFailedLogin({
        action: AuditActions.FAILED_LOGIN,
        module: 'auth',
        entityName: 'User',
        metadata: {
          email: loginDto.email,
          reason: 'Invalid credentials',
        },
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles?.map((role) => role.name) ?? [],
      permissions: user.permissions?.map((permission) => permission.name) ?? [],
    };

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: authUser.roles,
      permissions: authUser.permissions,
    };

    const result = {
      token: this.jwtService.sign(payload),
      user: authUser,
    };

    await this.auditService.logLogin({
      action: AuditActions.LOGIN,
      module: 'auth',
      entityName: 'User',
      entityId: user.id,
      userId: user.id,
      userName: user.name,
    });

    return result;
  }

  async register(createUserDto: CreateUserDto): Promise<AuthDto> {
    const existingUser = await this.userService.getUserByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const userId = randomUUID();
    this.auditContextService.set('userId', userId);
    this.auditContextService.set('userName', createUserDto.name);

    const user = await this.userService.addUser(
      createUserDto.email,
      createUserDto.name,
      createUserDto.password,
      createUserDto.roles,
      createUserDto.permissions,
      userId,
    );

    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles?.map((role) => role.name) ?? [],
      permissions: user.permissions?.map((permission) => permission.name) ?? [],
    };

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: authUser.roles,
      permissions: authUser.permissions,
    };

    return {
      token: this.jwtService.sign(payload),
      user: authUser,
    };
  }

  async myProfile(userId: string) {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles?.map((role) => role.name) ?? [],
        permissions: user.permissions?.map((permission) => permission.name) ?? [],
      },
    };
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    const updated = await this.userService.updateUser(userId, updateUserDto);
    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return {
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        roles: updated.roles?.map((role) => role.name) ?? [],
        permissions: updated.permissions?.map((permission) => permission.name) ?? [],
      },
    };
  }

  async getUserSettings(userId: string) {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles?.map((role) => role.name) ?? [],
        permissions: user.permissions?.map((permission) => permission.name) ?? [],
      },
    };
  }
}
