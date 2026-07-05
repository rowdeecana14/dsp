import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../../../shared/pagination/pagination.dto';
import { PaginationService, PaginatedResult } from '../../../shared/pagination/pagination.service';
import { UserEntity } from '../entities/user.entity';
import { UserService } from './user.service';
import { USERS_ALLOWED_SORT_FIELDS } from '../dto/users-pagination.dto';

@Injectable()
export class UsersPaginationService extends PaginationService<UserEntity, Omit<UserEntity, 'password'>> {
  protected readonly alias = 'user';
  protected readonly allowedSortFields = USERS_ALLOWED_SORT_FIELDS;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly userService: UserService,
  ) {
    super();
  }

  async list(query: PaginationDto): Promise<PaginatedResult<Omit<UserEntity, 'password'>>> {
    return this.paginate(this.userRepository, query, {
      allowedSortFields: this.allowedSortFields,
      transform: (user) => this.userService.sanitizeUser(user) as Omit<UserEntity, 'password'>,
      buildQuery: (qb) =>
        qb
          .leftJoinAndSelect('user.roles', 'roles')
          .leftJoinAndSelect('user.permissions', 'permissions')
          .distinct(true),
    });
  }
}

export default UsersPaginationService;
