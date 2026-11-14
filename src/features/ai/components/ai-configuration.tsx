import { LoadingSkeleton } from '@/components/loading-skeleton';
import { AiSettingsHistory } from './ai-settings-history';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AiEmbeddingVersions } from './ai-embedding-versions';
import { aiSettingsService } from '../services/ai-settings.service';
import type { AiFeatureSettings } from '../types/ai-settings';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { getApiError } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
const providerLabels: Record<string, string> = {
  gemini: 'Google Gemini',
  groq: 'Groq',
  openrouter: 'OpenRouter',
  cloudflare: 'Cloudflare Workers AI',
};
export function AiConfiguration({
  canManage = false,
}: {
  canManage?: boolean;
}) {
  const isSuperAdmin = useAuthStore(
    (state) => state.user?.role === 'super_admin'
  );
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['ai', 'admin', 'settings'],
    queryFn: aiSettingsService.read,
    refetchInterval: 15000,
  });
  const [draft, setDraft] = useState<
    (AiFeatureSettings & { revision: number }) | null
  >(null);
  const [busy, setBusy] = useState(false);
  const notifySuccess = (text: string) => {
    toast.success(text);
  };
  const notifyFailure = (cause: unknown) => {
    const text = getApiError(cause).message;
    toast.error(text);
  };

  const [activationRevision, setActivationRevision] = useState<number | null>(
    null
  );
  const data = query.data;
  const staleConfirmation =
    !busy &&
    !!data &&
    [draft?.revision, activationRevision].some(
      (revision) => revision != null && revision !== data.revision
    );
  useEffect(() => {
    if (data?.emergencyDisabled)
      toast.warning('AI đang được tắt khẩn cấp trên máy chủ.', {
        id: 'ai-admin-emergency',
      });
    else toast.dismiss('ai-admin-emergency');
  }, [data?.emergencyDisabled]);
  useEffect(() => {
    if (staleConfirmation)
      toast.warning(
        'Cấu hình AI đã thay đổi. Hãy hủy thay đổi hoặc xác nhận đang mở và thử lại.',
        { id: 'ai-admin-stale-confirmation' }
      );
    else toast.dismiss('ai-admin-stale-confirmation');
  }, [staleConfirmation]);
  if (query.isPending)
    return <LoadingSkeleton label="Đang tải cấu hình AI…" variant="form" />;
  if (!data)
    return (
      <div>
        <Button onClick={() => void query.refetch()}>Tải lại cấu hình</Button>
      </div>
    );
  const current = draft ?? { ...data.settings, revision: data.revision };
  const change = (values: Partial<AiFeatureSettings>) =>
    setDraft({ ...current, ...values });
  const semanticReady = data.semanticReady ?? data.vectorReady;
  return (
    <div className="space-y-6">
      <fieldset disabled={!canManage} className="min-w-0 space-y-6">
        {isSuperAdmin && (
          <div className="space-y-3 rounded-xl border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="font-medium">Kích hoạt kết nối AI</p>
                <p className="text-muted-foreground text-sm">
                  Kiểm tra dịch vụ và bật trợ lý. Dữ liệu tìm kiếm ngữ nghĩa
                  được kích hoạt riêng bên dưới.
                </p>
              </div>
              <Button
                disabled={busy || data.emergencyDisabled || !!draft}
                onClick={() => setActivationRevision(data.revision)}
              >
                {busy && activationRevision !== null
                  ? 'Đang kiểm tra kết nối…'
                  : data.settings.enabled
                    ? 'Kết nối lại AI'
                    : 'Kích hoạt AI'}
              </Button>
            </div>
            {draft && (
              <p className="text-muted-foreground text-sm">
                Hãy lưu hoặc hủy thay đổi đang chỉnh sửa trước khi kích hoạt.
              </p>
            )}
            {activationRevision !== null && (
              <div
                role="group"
                aria-label="Xác nhận kích hoạt AI"
                className="bg-muted/40 space-y-3 rounded-lg border p-3"
              >
                <p className="text-sm">
                  Thao tác sẽ gọi dịch vụ AI để kiểm tra JSON và câu trả lời, sử
                  dụng hạn mức của nhà cung cấp. Hệ thống chỉ bật AI sau khi
                  kiểm tra thành công; không xóa thời gian chờ quota hoặc sửa
                  API key.
                </p>

                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={
                      busy ||
                      data.emergencyDisabled ||
                      activationRevision !== data.revision
                    }
                    onClick={async () => {
                      if (busy || !canManage) return;
                      setBusy(true);

                      try {
                        const next =
                          await aiSettingsService.activate(activationRevision);
                        client.setQueryData(['ai', 'admin', 'settings'], next);
                        setDraft(null);
                        setActivationRevision(null);
                        notifySuccess(
                          'Kết nối AI đã được kiểm tra thành công và trợ lý đã được bật.'
                        );
                      } catch (failure) {
                        notifyFailure(failure);
                      } finally {
                        setBusy(false);
                        void client.invalidateQueries({
                          queryKey: ['ai', 'admin'],
                        });
                      }
                    }}
                  >
                    {busy ? 'Đang kiểm tra…' : 'Xác nhận kích hoạt'}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => setActivationRevision(null)}
                  >
                    Hủy xác nhận
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Tự động chuyển mô hình AI</CardTitle>
            <CardDescription>
              Hệ thống tự chuyển sang mô hình tiếp theo khi hết hạn mức dịch vụ
              hoặc gặp lỗi 429, trước khi bắt đầu hiển thị câu trả lời.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table aria-label="Trạng thái mô hình AI">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Ưu tiên</TableHead>
                  <TableHead>Nhà cung cấp / mô hình</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.routing ?? []).map((r) => (
                  <TableRow key={`${r.provider}:${r.model}`}>
                    <TableCell>{r.priority ?? '—'}</TableCell>
                    <TableCell>
                      <span className="block font-medium">
                        {providerLabels[r.provider] ?? r.provider}
                      </span>
                      <span className="text-muted-foreground block text-xs break-all">
                        {r.model}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          r.retryAt || (r.state && r.state !== 'ready')
                            ? 'outline'
                            : 'secondary'
                        }
                      >
                        {r.state === 'missing_key'
                          ? 'Chưa cấu hình khóa API'
                          : r.state === 'missing_account'
                            ? 'Thiếu mã tài khoản Cloudflare'
                            : r.state === 'excluded'
                              ? 'Không nằm trong thứ tự ưu tiên'
                              : r.retryAt
                                ? 'Tạm chờ'
                                : 'Có thể sử dụng'}
                      </Badge>
                      {r.retryAt && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          Thử lại sau{' '}
                          {new Date(r.retryAt).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!data.routing?.length && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      Chưa có nhà cung cấp được cấu hình trên máy chủ.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <p className="text-muted-foreground mt-4 text-xs">
              Khóa API được quản lý trên máy chủ. Mô hình dùng cấu hình mặc định
              hoặc thiết lập riêng từ môi trường.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Vận hành AI</CardTitle>
            <CardDescription>
              Bật các tính năng cần dùng. Hạn mức dịch vụ do nhà cung cấp quyết
              định; website không đặt trần lượt gọi theo ngày.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                if (busy || !canManage) return;
                setBusy(true);

                try {
                  const next = await aiSettingsService.save(current);
                  client.setQueryData(['ai', 'admin', 'settings'], next);
                  setDraft(null);
                  await client.invalidateQueries({ queryKey: ['ai', 'admin'] });
                  notifySuccess('Đã lưu cấu hình vận hành.');
                } catch (e) {
                  notifyFailure(e);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <div className="grid gap-3 md:grid-cols-2">
                {(
                  [
                    [
                      'enabled',
                      'Bật trợ lý AI',
                      'Cho phép khách trò chuyện với trợ lý mua sắm.',
                    ],
                    [
                      'semanticEnabled',
                      'Tìm kiếm ngữ nghĩa',
                      'Tìm sản phẩm theo ý nghĩa từ dữ liệu kiến thức đã kích hoạt.',
                    ],
                    [
                      'indexingEnabled',
                      'Tự động đồng bộ kiến thức',
                      'Cập nhật kiến thức khi sản phẩm và chính sách thay đổi.',
                    ],
                    [
                      'riskEnabled',
                      'Theo dõi rủi ro',
                      'Ghi nhận tín hiệu bất thường từ đăng nhập và đặt hàng.',
                    ],
                  ] as const
                ).map(([key, label, description]) => (
                  <div
                    key={key}
                    className="flex items-start justify-between gap-4 rounded-lg border p-4"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor={`ai-feature-${key}`}>{label}</Label>
                      <p
                        id={`ai-feature-${key}-description`}
                        className="text-muted-foreground text-xs leading-relaxed"
                      >
                        {description}
                      </p>
                    </div>
                    <Switch
                      id={`ai-feature-${key}`}
                      aria-describedby={`ai-feature-${key}-description`}
                      checked={current[key]}
                      disabled={
                        !canManage ||
                        busy ||
                        (key === 'semanticEnabled' &&
                          !semanticReady &&
                          !current.semanticEnabled)
                      }
                      onCheckedChange={(checked) => {
                        if (canManage) change({ [key]: checked });
                      }}
                    />
                  </div>
                ))}
              </div>
              {!semanticReady && (
                <p className="text-muted-foreground text-xs">
                  Tìm kiếm ngữ nghĩa cần một phiên bản kiến thức đã sẵn sàng và
                  được kích hoạt trong phần Đồng bộ kiến thức bên dưới. Bạn vẫn
                  có thể bật trợ lý AI và lưu cấu hình khi tắt Tìm kiếm ngữ
                  nghĩa.
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={
                    busy || (!!draft && draft.revision !== data.revision)
                  }
                >
                  {busy ? 'Đang lưu…' : 'Lưu cấu hình'}
                </Button>
                {draft && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => setDraft(null)}
                  >
                    Hủy thay đổi
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </fieldset>
      <AiEmbeddingVersions
        canManage={canManage}
        connections={data.connections}
        encryptionReady={true}
      />
      <AiSettingsHistory data={data} canManage={canManage} />
    </div>
  );
}
