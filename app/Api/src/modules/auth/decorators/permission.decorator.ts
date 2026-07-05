import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { PERMISSIONS_KEY } from '../constants/auth.constants';
import { PermissionGuard } from '../guards/permission.guard';
import { AuthGuard } from '../guards/auth.guard';

export const Permission = (...permissions: string[]) =>
  applyDecorators(SetMetadata(PERMISSIONS_KEY, permissions), UseGuards(AuthGuard, PermissionGuard));
