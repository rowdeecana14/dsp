import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeasurementEntity } from './entities/measurement.entity';

@Injectable()
export class MeasurementRepository {
  constructor(
    @InjectRepository(MeasurementEntity)
    private readonly repository: Repository<MeasurementEntity>,
  ) {}

  async findByStudyAndUser(studyInstanceUID: string, userId: string) {
    return this.repository.find({ where: { study_instance_uid: studyInstanceUID, user_id: userId } });
  }

  async findByViewerStateAndUser(viewerStateId: string, userId: string) {
    return this.repository.find({ where: { viewer_state_id: viewerStateId, user_id: userId } });
  }

  async findByIdAndUser(id: string, userId: string) {
    return this.repository.findOne({ where: { id, user_id: userId } });
  }

  async replaceMeasurementsForStudy(
    studyInstanceUID: string,
    userId: string,
    measurements: MeasurementEntity[],
    deletedByUserId?: string,
  ) {
    const existing = await this.repository.find({
      where: { study_instance_uid: studyInstanceUID, user_id: userId },
      withDeleted: true,
    });

    const deletedBy = deletedByUserId ?? userId;
    const incomingIds = new Set(
      measurements
        .map(measurement => measurement.id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    );

    for (const row of existing) {
      if (!incomingIds.has(row.id)) {
        if (!row.deleted_at) {
          await this.markDeletedById(row.id, userId, deletedBy);
        }
        continue;
      }

      if (row.deleted_at) {
        await this.repository.update(
          { id: row.id, user_id: userId },
          { deleted_at: null, deleted_by: null },
        );
      }
    }

    if (!measurements.length) {
      return [];
    }

    const saved: MeasurementEntity[] = [];
    for (const measurement of measurements) {
      const entity = {
        ...measurement,
        study_instance_uid: studyInstanceUID,
        user_id: userId,
        deleted_at: null,
        deleted_by: null,
      } as MeasurementEntity;

      saved.push(await this.repository.save(entity));
    }

    return saved;
  }

  async saveMeasurement(measurement: MeasurementEntity) {
    await this.repository.update(
      { id: measurement.id, user_id: measurement.user_id },
      {
        label: measurement.label,
        value: measurement.value,
        unit: measurement.unit,
        tool: measurement.tool,
        captured_at: measurement.captured_at,
        dental_preset_id: measurement.dental_preset_id,
        series_id: measurement.series_id,
        type: measurement.type,
        viewport: measurement.viewport,
        image_id: measurement.image_id,
        coordinates: measurement.coordinates as object,
      },
    );

    return this.findByIdAndUser(measurement.id, measurement.user_id);
  }

  async createMeasurement(measurement: MeasurementEntity) {
    return this.repository.save(measurement);
  }

  async deleteMeasurement(id: string, userId: string, deletedByUserId?: string) {
    const measurement = await this.repository.findOne({ where: { id, user_id: userId } });
    if (!measurement) {
      return false;
    }

    await this.markDeletedById(id, userId, deletedByUserId ?? userId);
    return true;
  }

  private async markDeletedById(id: string, userId: string, deletedByUserId: string) {
    await this.repository.update(
      { id, user_id: userId },
      {
        deleted_at: new Date(),
        deleted_by: deletedByUserId,
      },
    );
  }
}
