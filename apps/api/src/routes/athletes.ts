import type { FastifyInstance } from 'fastify';
import { authenticate, requireCoach } from '../middleware/auth.js';

async function getCoachId(app: FastifyInstance, userProfileId: string): Promise<string> {
  const coach = await app.prisma.coach.findUnique({ where: { userProfileId } });
  if (!coach) throw app.httpErrors.forbidden('Coach profile not found');
  return coach.id;
}

export async function registerAthleteRoutes(app: FastifyInstance) {
  // List all athletes
  app.get('/athletes', { preHandler: [authenticate, requireCoach] }, async (request) => {
    const athletes = await app.prisma.athlete.findMany({
      where: { coach: { userProfileId: request.user.id } },
      include: { userProfile: { select: { email: true, isActive: true } } },
      orderBy: { name: 'asc' },
    });

    return {
      success: true,
      data: athletes.map((a) => ({
        id: a.id,
        name: a.name,
        email: a.userProfile.email,
        isActive: a.userProfile.isActive,
        notes: a.notes,
      })),
    };
  });

  // Get athlete detail with programs
  app.get<{ Params: { id: string } }>(
    '/athletes/:id',
    { preHandler: [authenticate, requireCoach] },
    async (request) => {
      const coachId = await getCoachId(app, request.user.id);

      const athlete = await app.prisma.athlete.findFirst({
        where: { id: request.params.id, coachId },
        include: {
          userProfile: { select: { email: true, isActive: true } },
          programs: {
            select: { id: true, title: true, description: true },
            orderBy: { title: 'asc' },
          },
        },
      });

      if (!athlete) {
        throw app.httpErrors.notFound('Athlete not found');
      }

      return {
        success: true,
        data: {
          id: athlete.id,
          name: athlete.name,
          email: athlete.userProfile.email,
          isActive: athlete.userProfile.isActive,
          notes: athlete.notes,
          programs: athlete.programs.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
          })),
        },
      };
    },
  );
}
