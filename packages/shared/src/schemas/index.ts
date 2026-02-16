import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
