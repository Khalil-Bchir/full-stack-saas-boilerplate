/**
 * Redis Streams queue transport for Option C AI jobs.
 * Postgres `AiJob` remains the durable source of truth.
 */
export type AiQueueTransport = 'redis-streams';

export type AiQueueConfig = {
  redisUrl: string;
  streamKey: string;
  consumerGroup: string;
};
