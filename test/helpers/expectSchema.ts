import { z, type ZodSchema } from 'zod';

export function expectSchema<T extends ZodSchema>(
  data: unknown,
  schema: T,
): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.log(result.error.issues);
    throw new Error('Parsing did not succeed, see log.');
  }

  return result.data as T;
}
