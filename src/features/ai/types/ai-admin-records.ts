export type AiRecordKind = 'failures' | 'usage' | 'risks';
export interface AiAdminRecord {
  _id: string;
  updatedAt?: string;
  createdAt?: string;
  count?: number;
  event?: string;
  reason?: string;
  score?: number;
  error?: { code: string; stage: string; message: string };
}
export interface AiAdminRecords {
  rows: AiAdminRecord[];
  page: number;
  limit: number;
  total: number;
}
