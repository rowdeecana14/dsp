import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMeasurementDto {
  @IsString()
  @IsNotEmpty()
  study_instance_uid!: string;

  @IsOptional()
  @IsString()
  viewer_state_id?: string;

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
  dental_preset_id?: string;

  @IsOptional()
  @IsString()
  series_id?: string;

  @IsOptional()
  @IsString()
  captured_at?: string;

  @IsOptional()
  @IsObject()
  coordinates?: Record<string, unknown>;
}

export class PutMeasurementDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  tool?: string;

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
  dental_preset_id?: string;

  @IsOptional()
  @IsObject()
  coordinates?: Record<string, unknown>;
}

export class ViewerStateIdParamDto {
  @IsString()
  @IsNotEmpty()
  viewer_state_id!: string;
}
