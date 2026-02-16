import type { FastifyInstance } from "fastify";
import {
  registerCoachSchema,
  loginSchema,
  inviteAthleteSchema,
  activateAthleteSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} from "@treino/shared";
import { authenticate, requireCoach } from "../middleware/auth.js";
import * as authService from "../services/auth.service.js";

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (request, reply) => {
    const body = registerCoachSchema.parse(request.body);
    const result = await authService.registerCoach(app, body);
    return reply.code(201).send({ success: true, data: result });
  });

  app.post("/auth/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const result = await authService.login(app, body);
    return reply.send({ success: true, data: result });
  });

  app.post("/auth/refresh", async (request, reply) => {
    const body = refreshTokenSchema.parse(request.body);
    const result = await authService.refreshAccessToken(app, body.refreshToken);
    return reply.send({ success: true, data: result });
  });

  app.post(
    "/auth/logout",
    { onRequest: [authenticate] },
    async (request, reply) => {
      const body = refreshTokenSchema.parse(request.body);
      await authService.logout(app, body.refreshToken);
      return reply.send({ success: true, message: "Logged out" });
    },
  );

  app.post(
    "/auth/invite-athlete",
    { onRequest: [authenticate, requireCoach] },
    async (request, reply) => {
      const body = inviteAthleteSchema.parse(request.body);
      const result = await authService.inviteAthlete(
        app,
        request.user.id,
        body,
      );
      return reply.code(201).send({ success: true, data: result });
    },
  );

  app.post("/auth/activate", async (request, reply) => {
    const body = activateAthleteSchema.parse(request.body);
    await authService.activateAthlete(app, body.token, body.password);
    return reply.send({ success: true, message: "Account activated" });
  });

  app.post("/auth/forgot-password", async (request, reply) => {
    const body = requestPasswordResetSchema.parse(request.body);
    await authService.requestPasswordReset(app, body.email);
    // Always return success to avoid leaking email existence
    return reply.send({
      success: true,
      message: "If the email exists, a reset link has been sent",
    });
  });

  app.post("/auth/reset-password", async (request, reply) => {
    const body = resetPasswordSchema.parse(request.body);
    await authService.resetPassword(app, body.token, body.password);
    return reply.send({ success: true, message: "Password reset successful" });
  });

  app.get(
    "/auth/me",
    { onRequest: [authenticate] },
    async (request, reply) => {
      const result = await authService.getMe(app, request.user.id);
      return reply.send({ success: true, data: result });
    },
  );
}
