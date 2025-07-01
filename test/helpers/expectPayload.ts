import { payloadSchema } from 'test/e2e/payload.schema';
import { z, type ZodSchema } from 'zod';
import { expectSchema } from './expectSchema';
import { Response } from 'supertest';

export function expectPayload<T extends ZodSchema>(
  response: Response,
  {
    status,
    message,
    schema,
  }: {
    status: number;
    message?: string;
    schema?: T;
  },
): z.infer<T> {
  const payload = expectSchema(response.body, payloadSchema);

  expect({
    status: response.status,
    ...(message && { message: payload.message }),
  }).toEqual({
    status,
    ...(message && { message }),
  });

  if (!schema) return payload;
  const data = expectSchema(payload, schema);
  return data as T;
}
