import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MeasurementDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsString()
  @IsNotEmpty()
  unit!: string;

  @IsString()
  @IsNotEmpty()
  tool!: string;

  @IsString()
  @IsNotEmpty()
  captured_at!: string;

  @IsOptional()
  @IsObject()
  coordinates?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  dental_preset_id?: string;

  @IsOptional()
  @IsString()
  viewer_state_id?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  viewport?: string;

  @IsOptional()
  @IsString()
  image_id?: string;

  @IsOptional()
  @IsString()
  series_id?: string;
}

export class SeriesMeasurementsDto {
  @IsString()
  @IsNotEmpty()
  series_id!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MeasurementDto)
  measurements!: MeasurementDto[];
}

export class StudyMeasurementsDto {
  @IsString()
  @IsNotEmpty()
  study_instance_uid!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeriesMeasurementsDto)
  series!: SeriesMeasurementsDto[];
}

export class SaveMeasurementsDto {
  @ValidateIf(dto => !dto.study_instance_uid)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudyMeasurementsDto)
  studies?: StudyMeasurementsDto[];

  @ValidateIf(dto => !dto.studies?.length)
  @IsString()
  @IsNotEmpty()
  study_instance_uid?: string;

  @ValidateIf(dto => !dto.studies?.length)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MeasurementDto)
  measurements?: MeasurementDto[];
}
