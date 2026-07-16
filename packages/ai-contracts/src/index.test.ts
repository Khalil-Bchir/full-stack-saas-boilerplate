import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { AI_JOB_TYPES, buildCacheKey, isAiJobType } from './index.ts';

describe('ai-contracts', () => {
  it('validates known job types', () => {
    assert.equal(isAiJobType('ANALYZE_VIDEO'), true);
    assert.equal(isAiJobType('UNKNOWN'), false);
    assert.equal(AI_JOB_TYPES.length, 4);
  });

  it('builds cache keys', () => {
    assert.equal(buildCacheKey('MATCH', 'abc'), 'ai:cache:MATCH:abc');
  });
});
