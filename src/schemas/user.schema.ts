import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  role: z.enum(['admin', 'user']).default('user'),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  role: z.enum(['admin', 'user']).optional(),
});

export const getUsersSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type GetUsersQuery = z.infer<typeof getUsersSchema>;