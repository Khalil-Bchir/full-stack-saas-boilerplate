import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Redis } from 'ioredis';

declare module 'fastify' {
  interface FastifyInstance {
    /**
     * Shared Redis client for Option C (queue + cache + rate limit).
     * `null` when REDIS_URL is unset (e.g. unit tests).
     */
    redisClient: Redis | null;
  }
}

/**
 * Redis plugin for Option C:
 * - AI job queue (Streams)
 * - optional response cache
 * - shared rate-limit store when configured
 */
async function redis(fastify: FastifyInstance) {
  const url = process.env.REDIS_URL;

  if (!url) {
    fastify.log.warn('REDIS_URL not set — Redis features disabled');
    fastify.decorate('redisClient', null);
    return;
  }

  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });

  try {
    const pong = await client.ping();
    fastify.log.info({ pong }, 'Redis connected');
  } catch (err) {
    client.disconnect();
    fastify.log.error({ err }, 'Redis ping failed');
    throw err;
  }

  fastify.decorate('redisClient', client);

  fastify.addHook('onClose', async () => {
    await client.quit().catch(() => client.disconnect());
  });
}

export default fp(redis, {
  name: 'redis',
});
