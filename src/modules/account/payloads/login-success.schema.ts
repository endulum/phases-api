import { z } from 'zod';

export const loginSuccessSchema = z.object({
  message: z.literal('Successfully logged in.'),
  data: z.object({
    token: z.string(),
  }),
});
