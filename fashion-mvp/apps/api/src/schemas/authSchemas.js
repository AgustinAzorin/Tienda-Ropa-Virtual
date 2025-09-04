import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['buyer', 'seller', 'admin']).optional()
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
