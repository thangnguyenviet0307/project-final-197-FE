export interface EmbeddingVersion {
  _id: string;
  connectionId: string;
  provider: 'gemini' | 'openai';
  model: string;
  dimensions: number;
  indexName: string;
  state: 'queued' | 'building' | 'verifying' | 'ready' | 'failed' | 'cancelled';
  chunks: number;
  verified: number;
  failureCode?: string;
  nextRunAt?: string;
  finishedAt?: string;
  lastDeactivatedAt?: string;
  createdAt: string;
  autoActivate: boolean;
  indexDefinition: unknown;
}
export interface EmbeddingVersionsData {
  worker?: {
    running: boolean;
    lastTickAt: string | null;
    lastErrorCode: string | null;
    enabled: boolean;
    indexingEnabled: boolean;
    emergencyDisabled: boolean;
  };
  revision: number;
  activeId: string | null;
  versions: EmbeddingVersion[];
  collection: string;
}
export interface EmbeddingVersionInput {
  engine?: 'exact' | 'atlas';
  startSync?: boolean;
  revision: number;
  connectionId: string;
  model: string;
  dimensions: number;
}
