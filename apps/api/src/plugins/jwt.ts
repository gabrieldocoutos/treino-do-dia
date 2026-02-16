import jwt from "@fastify/jwt";
import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";

const jwtPlugin: FastifyPluginAsync = async (app) => {
  await app.register(jwt, {
    secret: process.env.JWT_SECRET!,
    sign: {
      expiresIn: "15m",
    },
  });
};

export default fp(jwtPlugin);
