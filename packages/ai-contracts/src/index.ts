/**
 * Shared AI async-job contracts used by:
 * - @saas-boilerplate/api (Fastify producer)
 * - apps/ai (Flask worker consumer)
 *
 * Source of truth for stream names, job types, and payload shapes.
 */

export const AI_STREAM_KEY_DEFAULT = 'ai:jobs';
export const AI_CONSUMER_GROUP_DEFAULT = 'ai-workers';
export const AI_CACHE_PREFIX = 'ai:cache:';

export const AI_JOB_TYPES = [
  'ANALYZE_VIDEO',
  'VERIFY_IDENTITY',
  'EMBED',
  'MATCH',
] as const;

export type AiJobType = (typeof AI_JOB_TYPES)[number];

export const AI_JOB_STATUSES = [
  'QUEUED',
  'RUNNING',
  'SUCCEEDED',
  'FAILED',
  'CANCELLED',
] as const;

export type AiJobStatus = (typeof AI_JOB_STATUSES)[number];

export type AiStreamJobMessage = {
  jobId: string;
  type: AiJobType;
  userId?: string | null;
  payload: Record<string, unknown>;
  enqueuedAt: string;
};

export type CreateAiJobRequest = {
  type: AiJobType;
  payload?: Record<string, unknown>;
  idempotencyKey?: string;
  maxAttempts?: number;
};

export type AiJobResponse = {
  id: string;
  type: AiJobType;
  status: AiJobStatus;
  userId: string | null;
  idempotencyKey: string | null;
  payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  error: string | null;
  attempts: number;
  maxAttempts: number;
  queuedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function isAiJobType(value: unknown): value is AiJobType {
  return typeof value === 'string' && (AI_JOB_TYPES as readonly string[]).includes(value);
}

export function buildCacheKey(type: AiJobType, hash: string): string {
  return `${AI_CACHE_PREFIX}${type}:${hash}`;
}
