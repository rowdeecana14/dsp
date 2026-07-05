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

  async saveMeasurements(measurements: MeasurementEntity[]) {
    return this.repository.save(measurements);
  }

  async deleteMeasurement(id: string, userId: string) {
    const measurement = await this.repository.findOne({ where: { id, user_id: userId } });
    if (!measurement) {
      return false;
    }

    await this.repository.softRemove(measurement);
    return true;
  }
}
