import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeasurementsController } from './measurements.controller';
import { MeasurementsService } from './measurements.service';
import { MeasurementEntity } from './entities/measurement.entity';
import { MeasurementRepository } from './measurement.repository';
import { MeasurementsPaginationService } from './services/measurements.pagination.service';

@Module({
  imports: [TypeOrmModule.forFeature([MeasurementEntity])],
  controllers: [MeasurementsController],
  providers: [MeasurementsService, MeasurementRepository, MeasurementsPaginationService],
})
export class MeasurementsModule {}
