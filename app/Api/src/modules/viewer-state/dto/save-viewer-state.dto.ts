import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class SaveViewerStateDto {
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

  @Transform(({ value, obj }) => value ?? obj.mode)
  @IsString()
  @IsOptional()
  mode?: string;

  @Transform(({ value, obj }) => value ?? obj.theme)
  @IsString()
  @IsOptional()
  theme?: string;

  @Transform(({ value, obj }) => value ?? obj.selectedTooth)
  @IsString()
  @IsOptional()
  selected_tooth?: string;

  @Transform(({ value, obj }) => value ?? obj.selected_tooth)
  @IsOptional()
  @IsString()
  selectedTooth?: string;

  @Transform(({ value, obj }) => value ?? obj.toothSystem)
  @IsString()
  @IsOptional()
  @IsIn(['FDI', 'Universal'])
  tooth_system?: 'FDI' | 'Universal';

  @Transform(({ value, obj }) => value ?? obj.tooth_system)
  @IsOptional()
  @IsString()
  toothSystem?: 'FDI' | 'Universal';

  @Transform(({ value, obj }) => value ?? obj.measurements)
  @IsArray()
  @IsOptional()
  measurements?: any[];

  @Transform(({ value, obj }) => value ?? obj.viewportLayout)
  @IsString()
  @IsOptional()
  viewport_layout?: string;

  @Transform(({ value, obj }) => value ?? obj.viewport_layout)
  @IsOptional()
  @IsString()
  viewportLayout?: string;
}
