import { ajvFilePlugin } from '@fastify/multipart';
import ajvFormat from 'ajv-formats';
import closeWithGrace from 'close-with-grace';
import { FastifyInstance, FastifyServerOptions, fastify } from 'fastify';

import { PrismaClient, User } from '@saas-boilerplate/types';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    verifyToken: () => Promise<void>;
  }
  interface FastifyRequest {
    loggedUser: User;
  }
}

async function createServerApp(opts: FastifyServerOptions) {
  const app = fastify(opts);

  await app.register(import('./app.js'));
  app.log.info('App ready');

  return app;
}

const isDevelopment = process.env.NODE_ENV !== 'production';

const app = await createServerApp({
  logger: isDevelopment
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      }
    : true,
  pluginTimeout: 20000,
  ajv: {
    customOptions: {
      allowUnionTypes: true,
      strict: false,
    },
    plugins: [ajvFormat as never, ajvFilePlugin as never],
  },
});

const closeListeners = closeWithGrace(
  {
    delay: parseInt(process.env.FASTIFY_CLOSE_GRACE_DELAY ?? '500', 10),
  },
  async ({ err }) => {
    if (err) {
      app.log.error(err);
    }
    await app.close();
  },
);

app.addHook('onClose', async () => {
  closeListeners.uninstall();
});

const port = parseInt(process.env.SERVER_PORT ?? '8000', 10);
const host = process.env.SERVER_HOST ?? '0.0.0.0';

try {
  await app.listen({ host, port });
  app.log.info(`Server listening on ${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
