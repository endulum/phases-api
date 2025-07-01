import { z } from 'zod';
import { requiredString } from 'src/shared/validators/required-string.validator';

export const createAccountSchema = z
  .object({
    username: requiredString()
      .regex(/^[a-z0-9-]+$/, {
        message:
          'Username must contain only lowercase letters, numbers, and hyphens',
      })
      .refine((val) => val.length >= 2 && val.length <= 16, {
        message: 'Username must be between 2 and 16 characters long.',
      }),
    password: requiredString().min(
      8,
      'Passwords must be eight characters long or more.',
    ),
    confirmPassword: requiredString(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type CreateAccountDto = z.infer<typeof createAccountSchema>;
