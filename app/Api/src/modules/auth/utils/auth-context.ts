import type { Request } from 'express';
import { UserService } from '../../users/services/user.service';

export type AuthContextValue = {
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
  roles?: string[];
  permissions?: string[];
  token?: string;
  _userEntity?: unknown;
  [key: string]: unknown;
};

export type ResolvedAuthContext = {
  ok: boolean;
  reason?: 'missing-user' | 'user-not-found';
  user?: unknown;
  roleNames: string[];
  permissionNames: string[];
  auth: AuthContextValue;
};

export function toNameList(values: Array<string | { name?: string } | null | undefined> = []): string[] {
  return values
    .map((value) => (typeof value === 'string' ? value : value?.name))
    .filter((value): value is string => Boolean(value));
}

export async function resolveAuthContext(request: Request, userService: UserService): Promise<ResolvedAuthContext> {
  const auth = (request.auth ?? {}) as AuthContextValue;
  const userId = auth.user?.id ?? (request as Request & { user?: { id?: string } }).user?.id;

  if (!userId) {
    return { ok: false, reason: 'missing-user', roleNames: [], permissionNames: [], auth };
  }

  const user = auth._userEntity ?? (await userService.getUserById(userId));

  if (!user) {
    return { ok: false, reason: 'user-not-found', roleNames: [], permissionNames: [], auth };
  }

  const roleNames = toNameList(
    auth.roles ?? (user as { roles?: Array<string | { name?: string }> }).roles ?? [],
  );
  const permissionNames = toNameList(
    auth.permissions ?? (user as { permissions?: Array<string | { name?: string }> }).permissions ?? [],
  );

  request.auth = {
    ...auth,
    user: {
      id: (user as { id: string }).id,
      email: (user as { email: string }).email,
      name: (user as { name: string }).name,
    },
    roles: roleNames,
    permissions: permissionNames,
    _userEntity: user,
  };

  return {
    ok: true,
    user,
    roleNames,
    permissionNames,
    auth: request.auth as AuthContextValue,
  };
}

export function attachAuthContext(auth: AuthContextValue = {}, user: unknown, token?: string): AuthContextValue {
  return {
    ...auth,
    user: {
      id: (user as { id?: string })?.id,
      email: (user as { email?: string })?.email,
      name: (user as { name?: string })?.name,
    },
    roles: toNameList((user as { roles?: Array<string | { name?: string }> })?.roles ?? []),
    permissions: toNameList((user as { permissions?: Array<string | { name?: string }> })?.permissions ?? []),
    token,
  };
}
