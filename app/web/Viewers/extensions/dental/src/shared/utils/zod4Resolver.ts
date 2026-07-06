import { toNestErrors } from '@hookform/resolvers';
import type { FieldError, FieldErrors, Resolver } from 'react-hook-form';
import type { ZodType } from 'zod';

/**
 * react-hook-form's stock zodResolver expects Zod 3's `error.errors`.
 * Zod 4 only exposes `issues`, so failed parses were re-thrown as runtime errors.
 */
export function zod4Resolver<TSchema extends ZodType>(
  schema: TSchema
): Resolver<import('zod').infer<TSchema>> {
  return async (values, _context, options) => {
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      return {
        values: result.data,
        errors: {} as FieldErrors,
      };
    }

    const flat: Record<string, FieldError> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.map(String).join('.');
      if (!path || flat[path]) {
        continue;
      }
      flat[path] = {
        type: issue.code,
        message: issue.message,
      };
    }

    return {
      values: {},
      errors: toNestErrors(flat, options),
    };
  };
}
