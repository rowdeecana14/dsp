import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';
import { UpdateMeasurementDto } from './update-measurement.dto';

export class BulkUpdateMeasurementsDto extends UpdateMeasurementDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ids!: string[];
}
