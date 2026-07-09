import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['src/routes/**'],
    server: {
      deps: {
        inline: ['@fastify/autoload'],
      },
    },
    env: {
      NODE_ENV: 'test',
      SERVER_PORT: '8000',
      SERVER_HOST: 'localhost',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/test?schema=public',
      ACCESS_TOKEN_SECRET: 'test-access-token-secret',
      ACCESS_TOKEN_TTL: '3600',
      COOKIE_SECRET: 'test-cookie-secret',
    },
  },
});
