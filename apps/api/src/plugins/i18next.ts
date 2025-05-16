import fp from 'fastify-plugin';
import i18next from 'i18next';
import i18nextBackend, { FsBackendOptions } from 'i18next-fs-backend';
import { LanguageDetector, plugin as i18nextMiddlewarePlugin } from 'i18next-http-middleware';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default fp(
  async (fastify) => {
    i18next
      .use(i18nextBackend)
      .use(LanguageDetector) // Updated usage
      .init<FsBackendOptions>({
        supportedLngs: ['ar', 'en', 'fr'],
        preload: ['ar', 'en', 'fr'],
        fallbackLng: 'en',
        backend: {
          loadPath: join(__dirname, '../translation/{{lng}}/{{ns}}.json'),
          addPath: join(__dirname, '../translation/{{lng}}/{{ns}}.missing.json'),
        },
      });

    fastify.register(i18nextMiddlewarePlugin as any, { i18next: i18next });
    fastify.decorate('i18n', i18next);
  },
  {
    name: 'i18next',
  },
);
