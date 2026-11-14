import { api } from '@/services/api';
import type { ApiResponse } from '@/types/api';
import type { AiRoutingMonitorData } from '../types/ai-routing';
export const aiRoutingService = {
  async read() {
    return (
      await api.get<ApiResponse<AiRoutingMonitorData>>(
        '/ai/admin/routing-monitor'
      )
    ).data.data;
  },
};
