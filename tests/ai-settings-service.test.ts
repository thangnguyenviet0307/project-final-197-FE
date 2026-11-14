import { afterEach, expect, it, vi } from 'vitest';
import { api } from '@/services/api';
import { aiSettingsService } from '@/features/ai/services/ai-settings.service';

afterEach(() => vi.restoreAllMocks());
it('clearing audit sends a revision and explicit confirmation', async () => {
  const remove = vi
    .spyOn(api, 'delete')
    .mockResolvedValue({ data: { data: {} } });
  await aiSettingsService.clearAudit(4);
  expect(remove).toHaveBeenCalledWith('/ai/admin/settings/audit', {
    data: { revision: 4, confirm: true },
  });
});
it('activation sends explicit confirmation and waits for the bounded backend probe', async () => {
  const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { data: {} } });
  await aiSettingsService.activate(3);
  expect(post).toHaveBeenCalledWith(
    '/ai/admin/settings/activate',
    { revision: 3, confirm: true },
    { timeout: 75000 }
  );
});

it('omits read-only embedding pointers when saving settings returned by the server', async () => {
  const writable = {
    revision: 7,
    enabled: true,
    semanticEnabled: true,
    indexingEnabled: true,
    riskEnabled: false,
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
