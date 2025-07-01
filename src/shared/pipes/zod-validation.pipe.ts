import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (result.success) return result;

    const { fieldErrors } = result.error.flatten();
    const singleFieldErrors = Object.fromEntries(
      Object.entries(fieldErrors).map(([field, messages]) => [
        field,
        messages ? messages[0] : null,
      ]),
    );
    throw new BadRequestException({
      message: 'There are some validation errors with your submission.',
      fieldErrors: singleFieldErrors,
    });
  }
}
