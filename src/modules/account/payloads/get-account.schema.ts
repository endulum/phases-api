import { z } from 'zod';

export const getSchema = z.object({
  data: z.object({
    user: z.object({
      id: z.number(),
      username: z.string(),
    }),
  }),
});
