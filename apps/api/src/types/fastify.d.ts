import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      id: string;
      role: 'COACH' | 'ATHLETE';
      email: string;
    };
    user: {
      id: string;
      role: 'COACH' | 'ATHLETE';
      email: string;
    };
  }
}
