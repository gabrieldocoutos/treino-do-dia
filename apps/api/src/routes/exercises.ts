import { createExerciseSchema } from '@treino/shared';
import type { FastifyInstance } from 'fastify';
import { authenticate, requireCoach } from '../middleware/auth.js';

export async function registerExerciseRoutes(app: FastifyInstance) {
  // List all exercises (global catalog)
  app.get('/exercises', { preHandler: [authenticate, requireCoach] }, async () => {
    const exercises = await app.prisma.exercise.findMany({
      orderBy: { name: 'asc' },
    });

    return { success: true, data: exercises };
  });

  // Create exercise
  app.post('/exercises', { preHandler: [authenticate, requireCoach] }, async (request, reply) => {
    const body = createExerciseSchema.parse(request.body);

    const exercise = await app.prisma.exercise.create({ data: body });

    return reply.code(201).send({ success: true, data: exercise });
  });
}
