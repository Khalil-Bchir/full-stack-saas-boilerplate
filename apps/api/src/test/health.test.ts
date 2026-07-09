import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildTestApp } from './build-test-app.js';

describe('GET /api/v1/health', () => {
  const apps: Awaited<ReturnType<typeof buildTestApp>>[] = [];

  afterEach(async () => {
    await Promise.all(apps.map((app) => app.close()));
    apps.length = 0;
  });

  it('returns ok when database is reachable', async () => {
    const app = await buildTestApp({
      prisma: {
        $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
      },
    });
    apps.push(app);

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: 'ok',
      message: 'All systems operational',
    });
  });

  it('propagates database errors', async () => {
    const app = await buildTestApp({
      prisma: {
        $queryRaw: vi.fn().mockRejectedValue(new Error('connection refused')),
      },
    });
    apps.push(app);

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
    });

    expect(response.statusCode).toBeGreaterThanOrEqual(500);
  });
});
