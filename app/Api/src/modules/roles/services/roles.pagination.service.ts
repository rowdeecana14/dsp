import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationService, PaginatedResult } from '../../../shared/pagination/pagination.service';
import { PaginationDto } from '../../../shared/pagination/pagination.dto';
import { RoleEntity } from '../entities/role.entity';
import { ROLES_ALLOWED_SORT_FIELDS } from '../dto/roles-pagination.dto';

@Injectable()
export class RolesPaginationService extends PaginationService<RoleEntity> {
  protected readonly alias = 'role';
  protected readonly allowedSortFields = ROLES_ALLOWED_SORT_FIELDS;
  protected readonly defaultSortField = 'created_at';

  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {
    super();
  }

  async list(query: PaginationDto): Promise<PaginatedResult<RoleEntity>> {
    return this.paginate(this.roleRepository, query, {
      buildQuery: (qb) => qb.leftJoinAndSelect('role.permissions', 'permissions').distinct(true),
    });
  }
}
