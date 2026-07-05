import { Injectable } from '@nestjs/common';
import { MeasurementRepository } from './measurement.repository';
import { MeasurementEntity } from './entities/measurement.entity';

@Injectable()
export class MeasurementsService {
  constructor(private readonly measurementRepository: MeasurementRepository) {}

  async getMeasurements(studyInstanceUID: string, userId: string) {
    return this.measurementRepository.findByStudyAndUser(studyInstanceUID, userId);
  }

  async saveMeasurements(studyInstanceUID: string, userId: string, measurements: any[]) {
    const entities = measurements.map((measurement) => ({
      id: measurement.id,
      study_instance_uid: studyInstanceUID,
      user_id: userId,
      label: measurement.label,
      value: measurement.value,
      unit: measurement.unit,
      tool: measurement.tool,
      captured_at: measurement.captured_at ?? measurement.capturedAt,
      coordinates: measurement.coordinates,
    })) as MeasurementEntity[];
    return this.measurementRepository.saveMeasurements(entities);
  }

  async deleteMeasurement(id: string, userId: string) {
    return this.measurementRepository.deleteMeasurement(id, userId);
  }
}
