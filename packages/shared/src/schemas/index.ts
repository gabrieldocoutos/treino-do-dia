import { z } from 'zod';

// User schemas

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

// Auth schemas

export const registerCoachSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const inviteAthleteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  notes: z.string().optional(),
});

export const activateAthleteSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RegisterCoach = z.infer<typeof registerCoachSchema>;
export type Login = z.infer<typeof loginSchema>;
export type InviteAthlete = z.infer<typeof inviteAthleteSchema>;
export type ActivateAthlete = z.infer<typeof activateAthleteSchema>;
export type RequestPasswordReset = z.infer<typeof requestPasswordResetSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type RefreshToken = z.infer<typeof refreshTokenSchema>;
