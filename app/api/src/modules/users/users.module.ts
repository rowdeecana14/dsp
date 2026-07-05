import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { PermissionEntity } from '../permissions/entities/permission.entity';
import { UserService } from './services/user.service';
import { UsersPaginationService } from './services/users.pagination.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity, PermissionEntity])],
  controllers: [UsersController],
  providers: [UserService, UsersPaginationService],
  exports: [UserService, UsersPaginationService],
})
export class UsersModule {}
