import { z } from 'zod';

export const signupSuccessSchema = z.object({
  message: z.literal('Account successfully created.'),
  data: z.object({
    newUser: z.object({
      id: z.number(),
      username: z.string(),
    }),
  }),
});
