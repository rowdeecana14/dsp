import { ArrayNotEmpty, IsArray, IsDateString, IsIn, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ValidateSortBy } from '../../../core/decorators/validate-sort-by.decorator';

export const AUDIT_ALLOWED_SORT_FIELDS = [
  'created_at',
  'user_id',
  'user_name',
  'action',
  'module',
  'entity_name',
  'entity_id',
  'request_id',
] as const;

export class AuditQueryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  user_id?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  entity?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  entity_id?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  action?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  module?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  request_id?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ValidateSortBy(AUDIT_ALLOWED_SORT_FIELDS)
  sort_by?: typeof AUDIT_ALLOWED_SORT_FIELDS[number] = 'created_at';

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsIn(['ASC', 'DESC'])
  sort_direction?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page_size?: number = 25;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  modules?: string[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  actions?: string[];
}
