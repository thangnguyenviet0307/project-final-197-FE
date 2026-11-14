export interface AiRoutingRun {
  _id: string;
  kind?: 'activation' | 'chat' | 'provider';
  stage: 'intent' | 'answer';
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'interrupted';
  createdAt: string;
  updatedAt: string;
  attempts: {
    phase?: 'intent' | 'answer';
    provider: string;
    model: string;
    status: 'running' | 'completed' | 'quota' | 'failed' | 'cancelled';
    startedAt: string;
    finishedAt?: string;
  }[];
}
export interface AiRoutingMonitorData {
  runs: AiRoutingRun[];
  sampledAt: string;
}
