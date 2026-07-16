import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AiJobsService } from './ai-jobs.js';

describe('AiJobsService', () => {
  const prisma = {
    aiJob: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  };

  const redis = {
    xgroup: vi.fn(),
    xadd: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('throws 503 when redis is missing', async () => {
    const service = new AiJobsService({ prisma: prisma as never, redis: null });
    await expect(
      service.createJob('user-1', { type: 'EMBED', payload: { text: 'x' } }),
    ).rejects.toMatchObject({ statusCode: 503 });
  });

  it('returns existing job for idempotency key', async () => {
    const existing = {
      id: 'job-1',
      type: 'EMBED',
      status: 'QUEUED',
      idempotencyKey: 'same-key-123',
    };
    prisma.aiJob.findUnique.mockResolvedValue(existing);

    const service = new AiJobsService({ prisma: prisma as never, redis: redis as never });
    const job = await service.createJob('user-1', {
      type: 'EMBED',
      idempotencyKey: 'same-key-123',
      payload: { text: 'hello' },
    });

    expect(job).toEqual(existing);
    expect(redis.xadd).not.toHaveBeenCalled();
  });

  it('creates job and enqueues to redis stream', async () => {
    prisma.aiJob.findUnique.mockResolvedValue(null);
    redis.get.mockResolvedValue(null);
    redis.xgroup.mockRejectedValue(new Error('BUSYGROUP Consumer Group name already exists'));
    const created = {
      id: 'job-2',
      type: 'MATCH',
      status: 'QUEUED',
      userId: 'user-1',
      payload: { candidateIds: ['a'] },
      idempotencyKey: null,
    };
    prisma.aiJob.create.mockResolvedValue(created);
    redis.xadd.mockResolvedValue('1-0');

    const service = new AiJobsService({ prisma: prisma as never, redis: redis as never });
    const job = await service.createJob('user-1', {
      type: 'MATCH',
      payload: { candidateIds: ['a'] },
    });

    expect(job.id).toBe('job-2');
    expect(redis.xadd).toHaveBeenCalled();
    expect(prisma.aiJob.create).toHaveBeenCalled();
  });
});
