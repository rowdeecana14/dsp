import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../shared/pagination/pagination.dto';
import { ValidateSortBy } from '../../../core/decorators/validate-sort-by.decorator';

export const MEASUREMENTS_ALLOWED_SORT_FIELDS = [
  'id',
  'label',
  'value',
  'unit',
  'tool',
  'captured_at',
  'created_at',
  'updated_at',
  'dental_preset_id',
] as const;

export class MeasurementsPaginationDto extends PaginationDto {
  @ApiPropertyOptional({ name: 'study_instance_uid' })
  @IsString()
  @IsNotEmpty()
  study_instance_uid!: string;

  @ApiPropertyOptional({ description: 'Search label, value, unit, tool, or preset id' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ name: 'dental_preset_id' })
  @IsOptional()
  @IsString()
  dental_preset_id?: string;

  @ApiPropertyOptional({
    name: 'series_ids',
    description: 'Comma-separated series instance UIDs',
  })
  @IsOptional()
  @IsString()
  series_ids?: string;

  @ApiPropertyOptional({
    name: 'series_id',
    description: 'Single series instance UID (alias for series_ids)',
  })
  @IsOptional()
  @IsString()
  series_id?: string;

  @ValidateSortBy(MEASUREMENTS_ALLOWED_SORT_FIELDS)
  declare sort_by?: typeof MEASUREMENTS_ALLOWED_SORT_FIELDS[number];
}
