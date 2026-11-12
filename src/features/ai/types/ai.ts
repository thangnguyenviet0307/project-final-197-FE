export interface AiProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  available: boolean;
  thumbnail: string | null;
  brand: string;
  category: string;
  description: string;
}
export interface AiSource {
  key: string;
  title: string;
  href: string;
}
export interface AiTurn {
  error?: { code?: string; message?: string; retryable?: boolean };
  requestId: string;
  content: string;
  answer: string;
  status: string;
  sources: AiSource[];
  products?: AiProduct[];
  expiresAt?: string;
}
export interface AiConversation {
  _id: string;
  status: string;
  lastActivityAt: string;
}
export interface AiHistory {
  conversation: {
    id: string;
    status: string;
    endedAt: string | null;
    lastActivityAt: string;
    expiresAt: string;
  };
  rows: AiTurn[];
  page: number;
}
export interface AiSearchResult {
  scope?: 'catalog' | 'ranked-candidates' | 'selected-products';
  rows: AiProduct[];
  total: number;
  page: number;
  limit: number;
  semantic: boolean;
}
export interface AiAdminStatus {
  failures?: {
    requestId: string;
    updatedAt: string;
    error: { code: string; stage: string; message: string };
  }[];
  config: {
    enabled: boolean;
    indexingEnabled: boolean;
    riskEnabled: boolean;
    model: string;
    embeddingModel: string;
    vectorIndex: string;
    dailyCalls: number;
  };
  conversations: number;
  chunks: number;
  usage: { _id: string; count: number; expiresAt: string }[];
  risks: {
    _id: string;
    event: string;
    reason: string;
    score: number;
    createdAt: string;
  }[];
  index: {
    state: string;
    attempts: number;
    lastSuccessAt?: string;
    nextRunAt: string;
  } | null;
}
