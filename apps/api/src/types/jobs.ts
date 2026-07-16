import type { AiJobResponse, AiJobStatus, AiJobType } from '@saas-boilerplate/ai-contracts';

export type { AiJobResponse, AiJobStatus, AiJobType };

export type AiJobListResponse = {
  jobs: AiJobResponse[];
};
