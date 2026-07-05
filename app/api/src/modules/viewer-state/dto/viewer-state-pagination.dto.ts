import { IsNotEmpty, IsString } from 'class-validator';
import { PaginationDto } from '../../../shared/pagination/pagination.dto';
import { ValidateSortBy } from '../../../core/decorators/validate-sort-by.decorator';

export const VIEWER_STATE_ALLOWED_SORT_FIELDS = [
  'id',
  'mode',
  'theme',
  'selected_tooth',
  'tooth_system',
  'viewport_layout',
  'created_at',
  'updated_at',
] as const;

export class ViewerStatePaginationDto extends PaginationDto {
  @IsString()
  @IsNotEmpty()
  study_instance_uid!: string;

  @ValidateSortBy(VIEWER_STATE_ALLOWED_SORT_FIELDS)
  declare sort_by?: typeof VIEWER_STATE_ALLOWED_SORT_FIELDS[number];
}
