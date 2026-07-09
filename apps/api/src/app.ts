import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {}

const options: AppOptions = {};

const ignoreTestFiles = (path: string) => /\.(test|spec)\.[cm]?[jt]s$/.test(path);

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
  await fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: Object.assign({ prefix: '/plugins' }, opts),
    dirNameRoutePrefix: false,
    forceESM: true,
    ignoreFilter: ignoreTestFiles,
  });
  fastify.log.info('Plugins loaded');

  await fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: Object.assign({ prefix: '/api' }, opts),
    routeParams: true,
    autoHooks: true,
    cascadeHooks: true,
    forceESM: true,
    ignoreFilter: ignoreTestFiles,
  });
  fastify.log.info('Routes loaded');
};

export default app;
export { app, options };
