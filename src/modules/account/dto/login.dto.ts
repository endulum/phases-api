import { z } from 'zod';
import { requiredString } from 'src/shared/validators/required-string.validator';

export const authAccountSchema = z.object({
  username: requiredString(),
  password: requiredString(),
});

export type AuthAccountDto = z.infer<typeof authAccountSchema>;
