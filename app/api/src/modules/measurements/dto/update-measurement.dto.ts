import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export const UPDATE_MEASUREMENT_ACTIONS = ['rename', 'lock', 'visible', 'hide'] as const;
export type UpdateMeasurementAction = (typeof UPDATE_MEASUREMENT_ACTIONS)[number];

export class UpdateMeasurementDto {
  @IsIn(UPDATE_MEASUREMENT_ACTIONS)
  action!: UpdateMeasurementAction;

  @ValidateIf(dto => dto.action === 'rename')
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  label?: string;

  @ValidateIf(dto => dto.action === 'lock')
  @IsBoolean()
  is_locked?: boolean;
}
