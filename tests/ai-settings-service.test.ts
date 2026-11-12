import { afterEach, expect, it, vi } from 'vitest';
import { api } from '@/services/api';
import { aiSettingsService } from '@/features/ai/services/ai-settings.service';

afterEach(() => vi.restoreAllMocks());

it('omits read-only embedding pointers when saving settings returned by the server', async () => {
  const writable = {
    revision: 7,
    enabled: true,
    semanticEnabled: true,
    indexingEnabled: true,
    riskEnabled: false,
    dailyCalls: 100,
    activeConnectionId: '6c90df97-2427-4ef9-9fe0-61d04c68dd73',
  };
  const put = vi.spyOn(api, 'put').mockResolvedValue({ data: { data: {} } });
  await aiSettingsService.save({
    ...writable,
    ...{
      activeEmbeddingGenerationId: 'generation',
      legacyEmbeddingConnectionId: 'legacy',
    },
  });
  expect(put).toHaveBeenCalledWith('/ai/admin/settings', writable);
});
