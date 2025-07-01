import { z } from 'zod';

export const updateSuccessSchema = z.object({
  message: z.literal('Account successfully updated.'),
  data: z.object({
    updatedUser: z.object({
      id: z.number(),
      username: z.string(),
    }),
    updatedPassword: z.boolean(),
  }),
});
