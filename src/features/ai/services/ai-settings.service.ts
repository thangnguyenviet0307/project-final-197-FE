import { api } from '@/services/api';
import type { ApiResponse } from '@/types/api';
import type { AiSettingsData, AiFeatureSettings } from '../types/ai-settings';
export const aiSettingsService = {
  async clearAudit(revision: number) {
    return (
      await api.delete<ApiResponse<AiSettingsData>>(
        '/ai/admin/settings/audit',
        { data: { revision, confirm: true } }
      )
    ).data.data;
  },
  async activate(revision: number) {
    return (
      await api.post<ApiResponse<AiSettingsData>>(
        '/ai/admin/settings/activate',
        { revision, confirm: true },
        { timeout: 75000 }
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
    const { revision, enabled, semanticEnabled, indexingEnabled, riskEnabled } =
      input;
    return (
      await api.put<ApiResponse<AiSettingsData>>('/ai/admin/settings', {
        revision,
        enabled,
        semanticEnabled,
        indexingEnabled,
        riskEnabled,
      })
    ).data.data;
  },
};
