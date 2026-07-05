import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from './entities/role.entity';
import { PermissionEntity } from '../permissions/entities/permission.entity';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RolesPaginationService } from './services/roles.pagination.service';
import { RbacService } from './services/rbac.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity, PermissionEntity])],
  controllers: [RolesController],
  providers: [RolesService, RolesPaginationService, RbacService],
  exports: [RolesService, RbacService],
})
export class RolesModule {}
