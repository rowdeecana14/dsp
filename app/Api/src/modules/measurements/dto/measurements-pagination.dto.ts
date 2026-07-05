import { IsNotEmpty, IsString } from 'class-validator';
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
] as const;

export class MeasurementsPaginationDto extends PaginationDto {
  @IsString()
  @IsNotEmpty()
  study_instance_uid!: string;

  @ValidateSortBy(MEASUREMENTS_ALLOWED_SORT_FIELDS)
  declare sort_by?: typeof MEASUREMENTS_ALLOWED_SORT_FIELDS[number];
}
