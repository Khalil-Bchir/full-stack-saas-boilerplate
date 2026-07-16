const aiJobTypeEnum = ['ANALYZE_VIDEO', 'VERIFY_IDENTITY', 'EMBED', 'MATCH'] as const;

const aiJobProperties = {
  id: { type: 'string' },
  type: { type: 'string', enum: [...aiJobTypeEnum] },
  status: {
    type: 'string',
    enum: ['QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED'],
  },
  userId: { type: ['string', 'null'] },
  idempotencyKey: { type: ['string', 'null'] },
  payload: { type: 'object', additionalProperties: true },
  result: { type: ['object', 'null'], additionalProperties: true },
  error: { type: ['string', 'null'] },
  attempts: { type: 'integer' },
  maxAttempts: { type: 'integer' },
  queuedAt: { type: 'string' },
  startedAt: { type: ['string', 'null'] },
  finishedAt: { type: ['string', 'null'] },
  createdAt: { type: 'string' },
  updatedAt: { type: 'string' },
};

export const createAiJobSchema = {
  tags: ['ai'],
  summary: 'Enqueue an async AI job',
  body: {
    type: 'object',
    additionalProperties: false,
    required: ['type'],
    properties: {
      type: { type: 'string', enum: [...aiJobTypeEnum] },
      payload: { type: 'object', additionalProperties: true },
      idempotencyKey: { type: 'string', minLength: 8, maxLength: 128 },
      maxAttempts: { type: 'integer', minimum: 1, maximum: 10 },
    },
  },
  response: {
    202: {
      type: 'object',
      properties: {
        job: { type: 'object', properties: aiJobProperties },
      },
    },
    503: {
      type: 'object',
      properties: {
        status: { type: 'number' },
        code: { type: 'string' },
        message: { type: 'string' },
      },
    },
  },
};

export const getAiJobSchema = {
  tags: ['ai'],
  summary: 'Get AI job status for the authenticated user',
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        job: { type: 'object', properties: aiJobProperties },
      },
    },
    404: {
      type: 'object',
      properties: {
        status: { type: 'number' },
        code: { type: 'string' },
        message: { type: 'string' },
      },
    },
  },
};

export const listAiJobsSchema = {
  tags: ['ai'],
  summary: 'List recent AI jobs for the authenticated user',
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        jobs: {
          type: 'array',
          items: { type: 'object', properties: aiJobProperties },
        },
      },
    },
  },
};
