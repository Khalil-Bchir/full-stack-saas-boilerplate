import { createHash } from 'node:crypto';

import { AiJobType, buildCacheKey } from '@saas-boilerplate/ai-contracts';
import { type Redis } from 'ioredis';

export class AiCacheService {
  constructor(
    private readonly redis: Redis | null,
    private readonly defaultTtlSeconds = 300,
  ) {}

  isEnabled(): boolean {
    return Boolean(this.redis);
  }

  hashPayload(payload: unknown): string {
    return createHash('sha256').update(JSON.stringify(payload ?? {})).digest('hex').slice(0, 32);
  }

  async get<T = unknown>(type: AiJobType, payload: unknown): Promise<T | null> {
    if (!this.redis) return null;
    const key = buildCacheKey(type, this.hashPayload(payload));
    const raw = await this.redis.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set(type: AiJobType, payload: unknown, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!this.redis) return;
    const key = buildCacheKey(type, this.hashPayload(payload));
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds ?? this.defaultTtlSeconds);
  }

  async invalidate(type: AiJobType, payload: unknown): Promise<void> {
    if (!this.redis) return;
    const key = buildCacheKey(type, this.hashPayload(payload));
    await this.redis.del(key);
  }
}
