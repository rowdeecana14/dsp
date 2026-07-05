import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

export function ValidateSortBy(allowedFields: readonly string[]) {
  return applyDecorators(
    IsOptional(),
    Transform(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    IsIn([...allowedFields], {
      message: `sort_by must be one of: ${allowedFields.join(', ')}`,
    }),
  );
}
