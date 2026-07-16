import {
  AI_CONSUMER_GROUP_DEFAULT,
  AI_STREAM_KEY_DEFAULT,
  AiJobType,
  CreateAiJobRequest,
} from '@saas-boilerplate/ai-contracts';
import { AiJob, AiJobStatus, Prisma, PrismaClient } from '@saas-boilerplate/types';
import { type Redis } from 'ioredis';

import { AiCacheService } from './ai-cache.js';

export type AiJobsServiceDeps = {
  prisma: PrismaClient;
  redis: Redis | null;
  streamKey?: string;
  consumerGroup?: string;
  cacheTtlSeconds?: number;
};

export class AiJobsService {
  private readonly streamKey: string;
  private readonly consumerGroup: string;
  private readonly cache: AiCacheService;

  constructor(private readonly deps: AiJobsServiceDeps) {
    this.streamKey = deps.streamKey || process.env.AI_STREAM_KEY || AI_STREAM_KEY_DEFAULT;
    this.consumerGroup =
      deps.consumerGroup || process.env.AI_CONSUMER_GROUP || AI_CONSUMER_GROUP_DEFAULT;
    this.cache = new AiCacheService(deps.redis, deps.cacheTtlSeconds ?? 300);
  }

  assertQueueReady(): void {
    if (!this.deps.redis) {
      const error = new Error('AI queue unavailable: REDIS_URL is not configured');
      (error as Error & { statusCode?: number }).statusCode = 503;
      throw error;
    }
  }

  async ensureConsumerGroup(): Promise<void> {
    this.assertQueueReady();
    const redis = this.deps.redis!;
    try {
      await redis.xgroup('CREATE', this.streamKey, this.consumerGroup, '0', 'MKSTREAM');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes('BUSYGROUP')) {
        throw err;
      }
    }
  }

  async createJob(userId: string, input: CreateAiJobRequest): Promise<AiJob> {
    this.assertQueueReady();

    if (input.idempotencyKey) {
      const existing = await this.deps.prisma.aiJob.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existing) {
        return existing;
      }
    }

    // Optional short-circuit for cacheable deterministic jobs (e.g. EMBED/MATCH).
    if (input.type === 'EMBED' || input.type === 'MATCH') {
      const cached = await this.cache.get<Record<string, unknown>>(input.type, input.payload ?? {});
      if (cached) {
        return this.deps.prisma.aiJob.create({
          data: {
            type: input.type,
            status: AiJobStatus.SUCCEEDED,
            userId,
            idempotencyKey: input.idempotencyKey,
            payload: (input.payload ?? {}) as Prisma.InputJsonValue,
            result: cached as Prisma.InputJsonValue,
            attempts: 0,
            maxAttempts: input.maxAttempts ?? 3,
            startedAt: new Date(),
            finishedAt: new Date(),
          },
        });
      }
    }

    const job = await this.deps.prisma.aiJob.create({
      data: {
        type: input.type as AiJobType,
        status: AiJobStatus.QUEUED,
        userId,
        idempotencyKey: input.idempotencyKey,
        payload: (input.payload ?? {}) as Prisma.InputJsonValue,
        maxAttempts: input.maxAttempts ?? 3,
      },
    });

    await this.ensureConsumerGroup();
    await this.enqueue(job);

    return job;
  }

  async getJobForUser(jobId: string, userId: string): Promise<AiJob | null> {
    return this.deps.prisma.aiJob.findFirst({
      where: { id: jobId, userId },
    });
  }

  async listJobsForUser(userId: string, take = 20): Promise<AiJob[]> {
    return this.deps.prisma.aiJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(take, 1), 100),
    });
  }

  /**
   * Called after a worker marks SUCCEEDED so API can warm cache for repeat queries.
   */
  async cacheJobResult(job: AiJob): Promise<void> {
    if (job.status !== AiJobStatus.SUCCEEDED || !job.result) return;
    if (job.type !== 'EMBED' && job.type !== 'MATCH') return;
    await this.cache.set(job.type as AiJobType, job.payload, job.result);
  }

  private async enqueue(job: AiJob): Promise<void> {
    const redis = this.deps.redis!;
    await redis.xadd(
      this.streamKey,
      '*',
      'jobId',
      job.id,
      'type',
      job.type,
      'userId',
      job.userId ?? '',
      'payload',
      JSON.stringify(job.payload ?? {}),
      'enqueuedAt',
      new Date().toISOString(),
    );
  }
}
