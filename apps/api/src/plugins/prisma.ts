import { PrismaClient } from '@prisma/client';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const prisma = new PrismaClient();

const prismaPlugin: FastifyPluginAsync = async (app) => {
  app.decorate('prisma', prisma);
  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
};

export default fp(prismaPlugin);

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
