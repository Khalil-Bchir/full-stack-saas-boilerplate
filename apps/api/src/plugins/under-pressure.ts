import underPressure from '@fastify/under-pressure';
import fp from 'fastify-plugin';

/**
 * Measure process load with automatic handling of "Service Unavailable" plugin for Fastify
 *
 * @see https://github.com/fastify/under-pressure
 */
export default fp(
  async (fastify) => {
    fastify.register(underPressure, {
      maxEventLoopDelay: 1000,
      maxHeapUsedBytes: 1000000000,
      maxRssBytes: 1000000000,
      maxEventLoopUtilization: 0.98,
      message: 'server under pressure',
      retryAfter: 50,
      exposeStatusRoute: {
        routeResponseSchemaOpts: {
          extraValue: { type: 'string' },
          metrics: {
            type: 'object',
            properties: {
              eventLoopDelay: { type: 'number' },
              rssBytes: { type: 'number' },
              heapUsed: { type: 'number' },
              eventLoopUtilized: { type: 'number' },
            },
          },
        },
        routeSchemaOpts: {
          hide: true,
        },
        routeOpts: {
          logLevel: 'debug',
          config: {
            someAttr: 'value',
          },
        },
        url: '/alive',
      },

      healthCheck: async (fastifyInstance: { memoryUsage: () => object }) => {
        return {
          metrics: fastifyInstance.memoryUsage(),
        };
      },
    });
  },
  {
    name: 'under-pressure',
  },
);
