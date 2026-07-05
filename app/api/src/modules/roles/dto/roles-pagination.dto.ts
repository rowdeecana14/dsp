import { PaginationDto } from '../../../shared/pagination/pagination.dto';
import { ValidateSortBy } from '../../../core/decorators/validate-sort-by.decorator';

export const ROLES_ALLOWED_SORT_FIELDS = ['id', 'name', 'display_name', 'created_at', 'updated_at'] as const;

export class RolesPaginationDto extends PaginationDto {
  @ValidateSortBy(ROLES_ALLOWED_SORT_FIELDS)
  declare sort_by?: typeof ROLES_ALLOWED_SORT_FIELDS[number];
}
