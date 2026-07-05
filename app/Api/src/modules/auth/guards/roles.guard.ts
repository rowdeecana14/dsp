import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../constants/auth.constants';
import { RbacService } from '../../roles/services/rbac.service';
import { UserService } from '../../users/services/user.service';
import { resolveAuthContext } from '../utils/auth-context';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const resolved = await resolveAuthContext(request, this.userService);

    if (!resolved.ok) {
      throw new ForbiddenException(
        resolved.reason === 'user-not-found' ? 'User is not authenticated' : 'Authenticated user required',
      );
    }

    if (!this.rbacService.hasRole(resolved.roleNames, requiredRoles)) {
      throw new ForbiddenException('Missing required role');
    }

    return true;
  }
}
