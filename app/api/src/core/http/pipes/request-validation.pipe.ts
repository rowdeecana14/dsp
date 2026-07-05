import { BadRequestException, ValidationPipe, ValidationError } from '@nestjs/common';

const flattenValidationErrors = (
  errors: ValidationError[],
  parentKey = '',
): Record<string, string[]> => {
  return errors.reduce((result, error) => {
    const key = parentKey ? `${parentKey}.${error.property}` : error.property;

    if (error.constraints) {
      result[key] = Object.values(error.constraints);
    }

    if (error.children && error.children.length) {
      Object.assign(result, flattenValidationErrors(error.children, key));
    }

    return result;
  }, {} as Record<string, string[]>);
};

export class RequestValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[] = []) => {
        const formatted = flattenValidationErrors(errors);

        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: formatted,
        });
      },
    });
  }
}
