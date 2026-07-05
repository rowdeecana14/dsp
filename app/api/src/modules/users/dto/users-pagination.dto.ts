import { PaginationDto } from '../../../shared/pagination/pagination.dto';
import { ValidateSortBy } from '../../../core/decorators/validate-sort-by.decorator';

export const USERS_ALLOWED_SORT_FIELDS = ['id', 'created_at', 'updated_at', 'name', 'email'] as const;

export class UsersPaginationDto extends PaginationDto {
  @ValidateSortBy(USERS_ALLOWED_SORT_FIELDS)
  declare sort_by?: typeof USERS_ALLOWED_SORT_FIELDS[number];
}
