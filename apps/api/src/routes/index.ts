import type { FastifyInstance } from "fastify";
import { registerAuthRoutes } from "./auth.js";

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    return { status: "ok" };
  });

  await registerAuthRoutes(app);
}
