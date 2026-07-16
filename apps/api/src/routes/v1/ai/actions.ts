import { CreateAiJobRequest } from '@saas-boilerplate/ai-contracts';
import { FastifyPluginAsync } from 'fastify';

import {
  createAiJobSchema,
  getAiJobSchema,
  listAiJobsSchema,
} from '../../../schemas/v1/ai.js';
import { AiJobsService } from '../../../services/ai-jobs.js';

function serializeJob(job: {
  id: string;
  type: string;
  status: string;
  userId: string | null;
  idempotencyKey: string | null;
  payload: unknown;
  result: unknown;
  error: string | null;
  attempts: number;
  maxAttempts: number;
  queuedAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...job,
    payload: (job.payload ?? {}) as Record<string, unknown>,
    result: (job.result as Record<string, unknown> | null) ?? null,
    queuedAt: job.queuedAt.toISOString(),
    startedAt: job.startedAt ? job.startedAt.toISOString() : null,
    finishedAt: job.finishedAt ? job.finishedAt.toISOString() : null,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}

const routes: FastifyPluginAsync = async (fastify) => {
  const aiJobs = new AiJobsService({
    prisma: fastify.prisma,
    redis: fastify.redisClient,
  });

  fastify.post<{ Body: CreateAiJobRequest }>(
    '/jobs',
    { schema: createAiJobSchema },
    async (request, reply) => {
      try {
        const job = await aiJobs.createJob(request.loggedUser.id, request.body);
        return reply.code(202).send({ job: serializeJob(job) });
      } catch (err) {
        const statusCode = (err as Error & { statusCode?: number }).statusCode;
        if (statusCode === 503) {
          return reply.code(503).send({
            status: 503,
            code: 'AI_QUEUE_UNAVAILABLE',
            message: (err as Error).message,
          });
        }
        throw err;
      }
    },
  );

  fastify.get<{ Params: { id: string } }>(
    '/jobs/:id',
    { schema: getAiJobSchema },
    async (request, reply) => {
      const job = await aiJobs.getJobForUser(request.params.id, request.loggedUser.id);
      if (!job) {
        return reply.code(404).send({
          status: 404,
          code: 'AI_JOB_NOT_FOUND',
          message: 'AI job not found',
        });
      }

      if (job.status === 'SUCCEEDED') {
        await aiJobs.cacheJobResult(job);
      }

      return reply.code(200).send({ job: serializeJob(job) });
    },
  );

  fastify.get<{ Querystring: { limit?: number } }>(
    '/jobs',
    { schema: listAiJobsSchema },
    async (request, reply) => {
      const jobs = await aiJobs.listJobsForUser(request.loggedUser.id, request.query.limit ?? 20);
      return reply.code(200).send({ jobs: jobs.map(serializeJob) });
    },
  );
};

export default routes;
