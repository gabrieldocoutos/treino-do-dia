import {
  bulkProgramExercisesSchema,
  createProgramSchema,
  createWorkoutSchema,
  updateProgramSchema,
  updateWorkoutSchema,
} from '@treino/shared';
import type { FastifyInstance } from 'fastify';
import { authenticate, requireCoach } from '../middleware/auth.js';

async function getCoachId(app: FastifyInstance, userProfileId: string): Promise<string> {
  const coach = await app.prisma.coach.findUnique({ where: { userProfileId } });
  if (!coach) throw app.httpErrors.forbidden('Coach profile not found');
  return coach.id;
}

async function verifyProgramOwnership(app: FastifyInstance, programId: string, coachId: string) {
  const program = await app.prisma.program.findUnique({ where: { id: programId } });
  if (!program || program.coachId !== coachId) {
    throw app.httpErrors.notFound('Program not found');
  }
  return program;
}

export async function registerProgramRoutes(app: FastifyInstance) {
  // List coach's programs
  app.get('/programs', { preHandler: [authenticate, requireCoach] }, async (request) => {
    const coachId = await getCoachId(app, request.user.id);
    const { athleteId } = request.query as { athleteId?: string };

    const programs = await app.prisma.program.findMany({
      where: { coachId, ...(athleteId ? { athleteId } : {}) },
      include: {
        _count: { select: { workouts: true } },
        athlete: { select: { id: true, name: true } },
      },
      orderBy: { title: 'asc' },
    });

    return {
      success: true,
      data: programs.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        workoutCount: p._count.workouts,
        athleteId: p.athlete.id,
        athleteName: p.athlete.name,
      })),
    };
  });

  // Create program
  app.post('/programs', { preHandler: [authenticate, requireCoach] }, async (request, reply) => {
    const coachId = await getCoachId(app, request.user.id);
    const body = createProgramSchema.parse(request.body);

    // Verify athlete belongs to coach
    const athlete = await app.prisma.athlete.findFirst({
      where: { id: body.athleteId, coachId },
    });
    if (!athlete) throw app.httpErrors.notFound('Athlete not found');

    const program = await app.prisma.program.create({
      data: { ...body, coachId },
    });

    return reply.code(201).send({ success: true, data: program });
  });

  // Get program with workouts and exercises
  app.get<{ Params: { id: string } }>(
    '/programs/:id',
    { preHandler: [authenticate, requireCoach] },
    async (request) => {
      const coachId = await getCoachId(app, request.user.id);
      await verifyProgramOwnership(app, request.params.id, coachId);

      const program = await app.prisma.program.findUnique({
        where: { id: request.params.id },
        include: {
          athlete: { select: { id: true, name: true } },
          workouts: {
            orderBy: { date: 'asc' },
            include: {
              exercises: {
                orderBy: { order: 'asc' },
                include: { exercise: true },
              },
            },
          },
        },
      });

      return { success: true, data: program };
    },
  );

  // Update program
  app.put<{ Params: { id: string } }>(
    '/programs/:id',
    { preHandler: [authenticate, requireCoach] },
    async (request) => {
      const coachId = await getCoachId(app, request.user.id);
      await verifyProgramOwnership(app, request.params.id, coachId);
      const body = updateProgramSchema.parse(request.body);

      const program = await app.prisma.program.update({
        where: { id: request.params.id },
        data: body,
      });

      return { success: true, data: program };
    },
  );

  // Delete program
  app.delete<{ Params: { id: string } }>(
    '/programs/:id',
    { preHandler: [authenticate, requireCoach] },
    async (request) => {
      const coachId = await getCoachId(app, request.user.id);
      await verifyProgramOwnership(app, request.params.id, coachId);

      const workouts = await app.prisma.workout.findMany({
        where: { programId: request.params.id },
        select: { id: true },
      });
      const workoutIds = workouts.map((w) => w.id);

      await app.prisma.$transaction([
        app.prisma.workoutLog.deleteMany({ where: { workoutId: { in: workoutIds } } }),
        app.prisma.programExercise.deleteMany({ where: { workoutId: { in: workoutIds } } }),
        app.prisma.workout.deleteMany({ where: { programId: request.params.id } }),
        app.prisma.program.delete({ where: { id: request.params.id } }),
      ]);

      return { success: true, message: 'Program deleted' };
    },
  );

  // Add workout to program
  app.post<{ Params: { id: string } }>(
    '/programs/:id/workouts',
    { preHandler: [authenticate, requireCoach] },
    async (request, reply) => {
      const coachId = await getCoachId(app, request.user.id);
      await verifyProgramOwnership(app, request.params.id, coachId);
      const body = createWorkoutSchema.parse(request.body);

      const workout = await app.prisma.workout.create({
        data: { ...body, programId: request.params.id },
      });

      return reply.code(201).send({ success: true, data: workout });
    },
  );

  // Update workout
  app.put<{ Params: { programId: string; workoutId: string } }>(
    '/programs/:programId/workouts/:workoutId',
    { preHandler: [authenticate, requireCoach] },
    async (request) => {
      const coachId = await getCoachId(app, request.user.id);
      await verifyProgramOwnership(app, request.params.programId, coachId);
      const body = updateWorkoutSchema.parse(request.body);

      const workout = await app.prisma.workout.update({
        where: { id: request.params.workoutId },
        data: body,
      });

      return { success: true, data: workout };
    },
  );

  // Delete workout
  app.delete<{ Params: { programId: string; workoutId: string } }>(
    '/programs/:programId/workouts/:workoutId',
    { preHandler: [authenticate, requireCoach] },
    async (request) => {
      const coachId = await getCoachId(app, request.user.id);
      await verifyProgramOwnership(app, request.params.programId, coachId);

      await app.prisma.$transaction([
        app.prisma.programExercise.deleteMany({ where: { workoutId: request.params.workoutId } }),
        app.prisma.workout.delete({ where: { id: request.params.workoutId } }),
      ]);

      return { success: true, message: 'Workout deleted' };
    },
  );

  // Bulk upsert exercises for a workout
  app.put<{ Params: { programId: string; workoutId: string } }>(
    '/programs/:programId/workouts/:workoutId/exercises',
    { preHandler: [authenticate, requireCoach] },
    async (request) => {
      const coachId = await getCoachId(app, request.user.id);
      await verifyProgramOwnership(app, request.params.programId, coachId);
      const { exercises } = bulkProgramExercisesSchema.parse(request.body);

      // Delete existing and recreate
      await app.prisma.$transaction([
        app.prisma.programExercise.deleteMany({ where: { workoutId: request.params.workoutId } }),
        ...exercises.map((ex) =>
          app.prisma.programExercise.create({
            data: { ...ex, workoutId: request.params.workoutId },
          }),
        ),
      ]);

      const updated = await app.prisma.programExercise.findMany({
        where: { workoutId: request.params.workoutId },
        orderBy: { order: 'asc' },
        include: { exercise: true },
      });

      return { success: true, data: updated };
    },
  );
}
