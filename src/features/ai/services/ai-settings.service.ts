import { api } from '@/services/api';
import type { ApiResponse } from '@/types/api';
import type {
  AiSettingsData,
  AiFeatureSettings,
  AiConnectionInput,
} from '../types/ai-settings';
export const aiSettingsService = {
  async clearAudit(revision: number) {
    return (
      await api.delete<ApiResponse<AiSettingsData>>(
        '/ai/admin/settings/audit',
        {
          data: { revision },
        }
      )
    ).data.data;
  },
  async initialize(revision: number) {
    return (
      await api.post<ApiResponse<AiSettingsData>>(
        '/ai/admin/settings/initialize',
        { revision }
      )
    ).data.data;
  },
  async read() {
    return (await api.get<ApiResponse<AiSettingsData>>('/ai/admin/settings'))
      .data.data;
  },
  async save(input: AiFeatureSettings & { revision: number }) {
    const {
      revision,
      enabled,
      semanticEnabled,
      indexingEnabled,
      riskEnabled,
      dailyCalls,
      activeConnectionId,
    } = input;
    return (
      await api.put<ApiResponse<AiSettingsData>>('/ai/admin/settings', {
        revision,
        enabled,
        semanticEnabled,
        indexingEnabled,
        riskEnabled,
        dailyCalls,
        activeConnectionId,
      })
    ).data.data;
  },
  async connection(input: AiConnectionInput, id?: string) {
    return (
      id
        ? await api.put<ApiResponse<AiSettingsData>>(
            `/ai/admin/connections/${encodeURIComponent(id)}`,
            input
          )
        : await api.post<ApiResponse<AiSettingsData>>(
            '/ai/admin/connections',
            input
          )
    ).data.data;
  },
  async remove(id: string, revision: number) {
    return (
      await api.delete<ApiResponse<AiSettingsData>>(
        `/ai/admin/connections/${encodeURIComponent(id)}`,
        { data: { revision } }
      )
    ).data.data;
  },
  async test(id: string, revision: number) {
    return (
      await api.post<ApiResponse<AiSettingsData>>(
        `/ai/admin/connections/${encodeURIComponent(id)}/test`,
        { revision },
        { timeout: 75000 }
      )
    ).data.data;
  },
};
