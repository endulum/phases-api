import { z } from 'zod';
import { requiredString } from 'src/shared/validators/required-string.validator';

export const updateAccountSchema = z
  .object({
    username: requiredString()
      .regex(/^[a-z0-9-]+$/, {
        message:
          'Username must contain only lowercase letters, numbers, and hyphens',
      })
      .refine((val) => val.length >= 2 && val.length <= 16, {
        message: 'Username must be between 2 and 16 characters long.',
      }),
    password: z
      .string()
      .min(8, 'Passwords must be eight characters long or more.')
      .optional(),
    confirmPassword: z.string().optional(),
    currentPassword: z.string().optional(),
  })
  .refine((data) => !data.password || data.confirmPassword, {
    message: 'Please confirm your new password.',
    path: ['confirmPassword'],
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })
  .refine((data) => !data.password || data.currentPassword, {
    message:
      'Please input your current password in order to use your new password.',
    path: ['currentPassword'],
  });

export type UpdateAccountDto = z.infer<typeof updateAccountSchema>;
