import { ArrayNotEmpty, IsArray, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class MeasurementDto {
  @IsOptional()
  @IsUUID()
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

  @Transform(({ value, obj }) => value ?? obj.capturedAt)
  @IsString()
  @IsNotEmpty()
  captured_at!: string;

  @Transform(({ value, obj }) => value ?? obj.captured_at)
  @IsOptional()
  @IsString()
  capturedAt?: string;

  @IsOptional()
  @IsObject()
  coordinates?: Record<string, any>;
}

export class SaveMeasurementsDto {
  @Transform(({ value, obj }) => value ?? obj.studyInstanceUID ?? obj.StudyInstanceUID)
  @IsString()
  @IsNotEmpty()
  study_instance_uid!: string;

  @Transform(({ value, obj }) => value ?? obj.study_instance_uid)
  @IsOptional()
  @IsString()
  studyInstanceUID?: string;

  @Transform(({ value, obj }) => value ?? obj.study_instance_uid)
  @IsOptional()
  @IsString()
  StudyInstanceUID?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MeasurementDto)
  measurements!: MeasurementDto[];
}
