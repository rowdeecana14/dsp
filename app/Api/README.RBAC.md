# RBAC Module (NestJS + TypeORM)

This document explains the RBAC implementation added to the project.

Overview:
- Entities: `User`, `Role`, `Permission` (ManyToMany relationships)
- Guards: `AuthGuard` (JWT), `RolesGuard`, `PermissionGuard`
- Decorators: `@Permission(...)`, `@Roles(...)`
- Services: `UserService`, `RolesService`, `PermissionsService`, `RbacService`
- Seed: `src/database/seeds/rbac.seed.ts`
- Migrations: `src/database/migrations/*` (includes RBAC tables migration)

Key files:
- `src/entities/*` — entity definitions
- `src/modules/roles` — roles CRUD and assignment
- `src/modules/permissions` — permissions CRUD
- `src/common/decorators/permission.decorator.ts` — apply required permissions
- `src/common/guards/permission.guard.ts` — enforces permissions

JWT payload includes `sub`, `email`, `roles`, and `permissions` so permission checks can be done without DB roundtrips.

To seed RBAC data:
```
pnpm --filter api --workspace-root run seed:rbac
```

To run migrations inside the container (example):
```
docker compose -f docker/docker-compose.yml exec -T api pnpm run migration:run
```
