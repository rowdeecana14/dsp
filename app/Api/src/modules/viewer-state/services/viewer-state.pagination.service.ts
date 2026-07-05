import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationService, PaginatedResult } from '../../../shared/pagination/pagination.service';
import { ViewerStateEntity } from '../entities/viewer-state.entity';
import { VIEWER_STATE_ALLOWED_SORT_FIELDS, ViewerStatePaginationDto } from '../dto/viewer-state-pagination.dto';

@Injectable()
export class ViewerStatePaginationService extends PaginationService<ViewerStateEntity> {
  protected readonly alias = 'viewer_state';
  protected readonly allowedSortFields = VIEWER_STATE_ALLOWED_SORT_FIELDS;
  protected readonly defaultSortField = 'created_at';

  constructor(
    @InjectRepository(ViewerStateEntity)
    private readonly viewerStateRepository: Repository<ViewerStateEntity>,
  ) {
    super();
  }

  async list(query: ViewerStatePaginationDto, userId: string): Promise<PaginatedResult<ViewerStateEntity>> {
    return this.paginate(this.viewerStateRepository, query, {
      buildQuery: (qb) =>
        qb
          .where('viewer_state.study_instance_uid = :studyInstanceUid', { studyInstanceUid: query.study_instance_uid })
          .andWhere('viewer_state.user_id = :userId', { userId }),
    });
  }
}
