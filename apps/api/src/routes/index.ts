import type { FastifyInstance } from 'fastify';
import { registerAthleteRoutes } from './athletes.js';
import { registerAuthRoutes } from './auth.js';
import { registerExerciseRoutes } from './exercises.js';
import { registerProgramRoutes } from './programs.js';

export async function registerRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    return { status: 'ok' };
  });

  await registerAuthRoutes(app);
  await registerAthleteRoutes(app);
  await registerProgramRoutes(app);
  await registerExerciseRoutes(app);
}
