import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationService, PaginatedResult } from '../../../shared/pagination/pagination.service';
import { PaginationDto } from '../../../shared/pagination/pagination.dto';
import { PermissionEntity } from '../entities/permission.entity';
import { PERMISSIONS_ALLOWED_SORT_FIELDS } from '../dto/permissions-pagination.dto';

@Injectable()
export class PermissionsPaginationService extends PaginationService<PermissionEntity> {
  protected readonly alias = 'permission';
  protected readonly allowedSortFields = PERMISSIONS_ALLOWED_SORT_FIELDS;
  protected readonly defaultSortField = 'created_at';

  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {
    super();
  }

  async list(query: PaginationDto): Promise<PaginatedResult<PermissionEntity>> {
    return this.paginate(this.permissionRepository, query);
  }
}
