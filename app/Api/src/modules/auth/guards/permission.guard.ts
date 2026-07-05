import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../constants/auth.constants';
import { RbacService } from '../../roles/services/rbac.service';
import { UserService } from '../../users/services/user.service';
import { resolveAuthContext } from '../utils/auth-context';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const resolved = await resolveAuthContext(request, this.userService);

    if (!resolved.ok) {
      throw new ForbiddenException(
        resolved.reason === 'user-not-found' ? 'User is not authenticated' : 'Authenticated user required',
      );
    }

    const hasPermission = await Promise.all(
      requiredPermissions.map((permission) =>
        this.rbacService.hasPermission(resolved.roleNames, resolved.permissionNames, permission),
      ),
    );

    if (!hasPermission.every(Boolean)) {
      throw new ForbiddenException('Missing required permission');
    }

    return true;
  }
}
