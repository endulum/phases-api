import { type Response } from 'supertest';
import { z } from 'zod';
import { expectPayload } from './expectPayload';

const payloadWithErrorsSchema = z.strictObject({
  message: z.literal('There are some validation errors with your submission.'),
  fieldErrors: z
    .record(z.string(), z.string())
    .refine((val) => Object.keys(val).length > 0, {
      message: 'There should be at least one key in fieldErrors.',
    }),
});

export async function expectFieldErrors({
  callback,
  correctForm,
  wrongFields,
}: {
  callback: (form: Record<string, string>) => Promise<Response>;
  correctForm: Record<string, string>;
  wrongFields: { [key: string]: string }[];
}) {
  for (const wrongField of wrongFields) {
    const form = { ...correctForm, ...wrongField };
    const res = await callback(form);
    try {
      expectPayload(res, {
        status: 400,
        schema: payloadWithErrorsSchema,
      });
    } catch (e) {
      // log what form was given so we can see it
      console.dir(
        { received_body: res.body, sent_form: form },
        { depth: null },
      );
      throw e;
    }
  }
}
