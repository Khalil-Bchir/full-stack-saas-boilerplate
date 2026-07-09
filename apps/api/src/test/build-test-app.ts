import { ajvFilePlugin } from '@fastify/multipart';
import ajvFormat from 'ajv-formats';
import { FastifyInstance, FastifyServerOptions, fastify } from 'fastify';
import fastifyOverride from 'fastify-override';
import fp from 'fastify-plugin';

import { PrismaClient } from '@saas-boilerplate/types';

export type TestAppOverrides = {
  prisma?: Partial<PrismaClient>;
};

export async function buildTestApp(
  overrides: TestAppOverrides = {},
  opts: FastifyServerOptions = {},
): Promise<FastifyInstance> {
  const app = fastify({
    logger: false,
    pluginTimeout: 20000,
    ajv: {
      customOptions: {
        allowUnionTypes: true,
        strict: false,
      },
      plugins: [ajvFormat as never, ajvFilePlugin as never],
    },
    ...opts,
  });

  await app.register(fastifyOverride, {
    override: {
      plugins: {
        prisma: fp(
          async (instance) => {
            instance.decorate('prisma', overrides.prisma as PrismaClient);
          },
          { name: 'prisma' },
        ),
      },
    },
  });

  await app.register(import('../app.js'));
  await app.ready();

  return app;
}
