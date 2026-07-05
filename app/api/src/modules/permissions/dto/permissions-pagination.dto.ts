import { PaginationDto } from '../../../shared/pagination/pagination.dto';
import { ValidateSortBy } from '../../../core/decorators/validate-sort-by.decorator';

export const PERMISSIONS_ALLOWED_SORT_FIELDS = ['id', 'name', 'display_name', 'created_at', 'updated_at'] as const;

export class PermissionsPaginationDto extends PaginationDto {
  @ValidateSortBy(PERMISSIONS_ALLOWED_SORT_FIELDS)
  declare sort_by?: typeof PERMISSIONS_ALLOWED_SORT_FIELDS[number];
}
