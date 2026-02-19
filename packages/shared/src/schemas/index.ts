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

// Program schemas

export const createProgramSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  athleteId: z.string().uuid(),
});

export const updateProgramSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const createWorkoutSchema = z.object({
  date: z.coerce.date(),
  title: z.string().optional(),
});

export const updateWorkoutSchema = z.object({
  date: z.coerce.date().optional(),
  title: z.string().optional(),
});

export const programExerciseSchema = z.object({
  exerciseId: z.string().uuid(),
  sets: z.string().optional(),
  reps: z.string().optional(),
  load: z.string().optional(),
  notes: z.string().optional(),
  order: z.number().int().min(0),
});

export const bulkProgramExercisesSchema = z.object({
  exercises: z.array(programExerciseSchema),
});

// Exercise schemas

export const createExerciseSchema = z.object({
  name: z.string().min(1),
  videoUrl: z.string().url().optional(),
});

export type CreateProgram = z.infer<typeof createProgramSchema>;
export type UpdateProgram = z.infer<typeof updateProgramSchema>;
export type CreateWorkout = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkout = z.infer<typeof updateWorkoutSchema>;
export type ProgramExerciseInput = z.infer<typeof programExerciseSchema>;
export type BulkProgramExercises = z.infer<typeof bulkProgramExercisesSchema>;
export type CreateExercise = z.infer<typeof createExerciseSchema>;
