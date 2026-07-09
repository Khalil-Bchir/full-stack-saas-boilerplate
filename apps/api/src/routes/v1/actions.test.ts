import Fastify from 'fastify';
import { afterEach, describe, expect, it, vi } from 'vitest';

import healthRoutes from './actions.js';

describe('GET /health', () => {
  const apps: ReturnType<typeof Fastify>[] = [];

  afterEach(async () => {
    await Promise.all(apps.map((app) => app.close()));
    apps.length = 0;
  });

  it('returns ok when database is reachable', async () => {
    const app = Fastify({ logger: false });
    apps.push(app);

    app.decorate('prisma', {
      $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    });

    await app.register(healthRoutes, { prefix: '/v1' });

    const response = await app.inject({
      method: 'GET',
      url: '/v1/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: 'ok',
      message: 'All systems operational',
    });
  });

  it('propagates database errors', async () => {
    const app = Fastify({ logger: false });
    apps.push(app);

    app.decorate('prisma', {
      $queryRaw: vi.fn().mockRejectedValue(new Error('connection refused')),
    });

    await app.register(healthRoutes, { prefix: '/v1' });

    const response = await app.inject({
      method: 'GET',
      url: '/v1/health',
    });

    expect(response.statusCode).toBeGreaterThanOrEqual(500);
  });
});
