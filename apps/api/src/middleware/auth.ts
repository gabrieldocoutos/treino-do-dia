import type { FastifyRequest, FastifyReply } from "fastify";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.unauthorized("Invalid or expired token");
  }
}

export async function requireCoach(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (request.user.role !== "COACH") {
    return reply.forbidden("Coach access required");
  }
}

export async function requireAthlete(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (request.user.role !== "ATHLETE") {
    return reply.forbidden("Athlete access required");
  }
}
