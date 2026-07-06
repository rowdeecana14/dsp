import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationService, PaginatedResult } from '../../../shared/pagination/pagination.service';
import { MeasurementEntity } from '../entities/measurement.entity';
import { MEASUREMENTS_ALLOWED_SORT_FIELDS, MeasurementsPaginationDto } from '../dto/measurements-pagination.dto';

@Injectable()
export class MeasurementsPaginationService extends PaginationService<MeasurementEntity> {
  protected readonly alias = 'measurement';
  protected readonly allowedSortFields = MEASUREMENTS_ALLOWED_SORT_FIELDS;
  protected readonly defaultSortField = 'created_at';

  constructor(
    @InjectRepository(MeasurementEntity)
    private readonly measurementRepository: Repository<MeasurementEntity>,
  ) {
    super();
  }

  async list(query: MeasurementsPaginationDto, userId: string): Promise<PaginatedResult<MeasurementEntity>> {
    return this.paginate(this.measurementRepository, query, {
      buildQuery: (qb) => {
        qb
          .where('measurement.study_instance_uid = :studyInstanceUid', {
            studyInstanceUid: query.study_instance_uid,
          })
          .andWhere('measurement.user_id = :userId', { userId });

        const search = query.search?.trim();
        if (search) {
          qb.andWhere(
            `(
              LOWER(measurement.label) LIKE LOWER(:search)
              OR LOWER(measurement.value) LIKE LOWER(:search)
              OR LOWER(measurement.unit) LIKE LOWER(:search)
              OR LOWER(measurement.tool) LIKE LOWER(:search)
              OR LOWER(measurement.dental_preset_id) LIKE LOWER(:search)
            )`,
            { search: `%${search}%` },
          );
        }

        const presetId = query.dental_preset_id?.trim();
        if (presetId) {
          qb.andWhere('measurement.dental_preset_id = :dentalPresetId', {
            dentalPresetId: presetId,
          });
        }

        const seriesIds = query.series_ids
          ?.split(',')
          .map(id => id.trim())
          .filter(Boolean);
        if (seriesIds?.length) {
          qb.andWhere('measurement.series_id IN (:...seriesIds)', { seriesIds });
        }

        return qb;
      },
    });
  }
}
