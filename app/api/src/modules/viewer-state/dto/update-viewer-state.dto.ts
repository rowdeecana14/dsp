import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateViewerStateDto {
  @IsOptional()
  @IsString()
  mode?: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  selected_tooth?: string;

  @IsOptional()
  @IsString()
  tooth_system?: string;

  @IsOptional()
  @IsString()
  viewport_layout?: string;

  @IsOptional()
  @IsString()
  patient_id?: string;

  @IsOptional()
  @IsObject()
  viewport_config?: Record<string, unknown>;
}
