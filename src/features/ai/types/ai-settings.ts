export interface AiConnection {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'xai';
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
  dailyCalls: number;
  activeConnectionId: string | null;
}
export interface AiSettingsData {
  revision: number;
  source: 'environment' | 'database';
  encryptionReady: boolean;
  vectorReady: boolean;
  semanticReady?: boolean;
  activeEmbeddingGenerationId?: string | null;
  legacyEmbeddingConnectionId?: string | null;
  providerModels?: Record<'gemini' | 'openai' | 'xai', string[]>;
  emergencyDisabled: boolean;
  settings: AiFeatureSettings;
  connections: AiConnection[];
  suggestedModels: string[];
  audit: { action: string; actor: string; at: string; connectionId?: string }[];
}
export interface AiConnectionInput {
  revision: number;
  name: string;
  provider: 'gemini' | 'openai' | 'xai';
  model: string;
  apiKey?: string;
}
