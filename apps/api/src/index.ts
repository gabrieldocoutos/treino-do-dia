import sensible from '@fastify/sensible';
import Fastify from 'fastify';
import { registerCors } from './plugins/cors.js';
import jwtPlugin from './plugins/jwt.js';
import prismaPlugin from './plugins/prisma.js';
import { registerRoutes } from './routes/index.js';

const app = Fastify({
  logger: true,
});

await app.register(sensible);
await app.register(prismaPlugin);
await app.register(jwtPlugin);
await registerCors(app);
await registerRoutes(app);

const port = Number(process.env.PORT) || 3333;

try {
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`Server running on http://localhost:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
