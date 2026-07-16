import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const { prisma } = fastify;
  fastify.get(
    '/health',
    {
      schema: {
        tags: ['health'],
        description: 'Health check',
      },
    },
    async function (request, reply) {
      try {
        await prisma.$queryRaw`SELECT 1`;

        let redis: 'up' | 'down' | 'disabled' = 'disabled';
        if (fastify.redisClient) {
          try {
            const pong = await fastify.redisClient.ping();
            redis = pong === 'PONG' ? 'up' : 'down';
          } catch {
            redis = 'down';
          }
        }

        return reply.status(200).send({
          status: 'ok',
          message: 'All systems operational',
          redis,
        });
      } catch (err: any) {
        console.error(err);

        throw err;
      }
    },
  );
};

export default routes;
