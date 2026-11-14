export interface AiConnection {
  id: string;
  name: string;
  provider: 'gemini' | 'groq' | 'openrouter' | 'cloudflare';
  model: string;
  keyHint: string;
  checkedOk: boolean;
  checkedAt?: string;
  checkCode?: string;
}
export interface AiFeatureSettings {
  enabled: boolean;
  semanticEnabled: boolean;
  indexingEnabled: boolean;
  riskEnabled: boolean;
}
export interface AiSettingsData {
  routing?: {
    provider: string;
    model: string;
    priority: number | null;
    state?: 'ready' | 'missing_key' | 'missing_account' | 'excluded';
    retryAt: string | null;
  }[];
  credentialSource?: 'environment';
  automaticRouting?: boolean;
  revision: number;
  source: 'environment' | 'database';
  encryptionReady: boolean;
  vectorReady: boolean;
  semanticReady?: boolean;
  activeEmbeddingGenerationId?: string | null;
  legacyEmbeddingConnectionId?: string | null;
  providerModels?: Record<
    'gemini' | 'groq' | 'openrouter' | 'cloudflare',
    string[]
  >;
  emergencyDisabled: boolean;
  settings: AiFeatureSettings;
  connections: AiConnection[];
  suggestedModels: string[];
  audit: { action: string; actor: string; at: string; connectionId?: string }[];
}
