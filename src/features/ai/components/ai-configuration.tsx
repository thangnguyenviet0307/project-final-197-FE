import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AiEmbeddingVersions } from './ai-embedding-versions';
import { aiSettingsService } from '../services/ai-settings.service';
import type { AiFeatureSettings } from '../types/ai-settings';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
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
const auditLabels: Record<string, string> = {
  'settings.updated': 'Cập nhật vận hành',
  'settings.activated': 'Kiểm tra kết nối và kích hoạt AI',
  'settings.initialized': 'Khởi tạo cấu hình',
  'embedding.created': 'Tạo phiên bản kiến thức',
  'embedding.activated': 'Kích hoạt phiên bản kiến thức',
  'embedding.legacy': 'Ngừng dùng phiên bản kiến thức',
  'embedding.retry': 'Thử lại đồng bộ',
  'embedding.cancel': 'Hủy đồng bộ',
  'embedding.delete': 'Xóa phiên bản kiến thức',
  'connection.created': 'Thêm kết nối',
  'connection.updated': 'Cập nhật kết nối',
  'connection.deleted': 'Xóa kết nối',
  'connection.tested': 'Kiểm tra kết nối',
};
export function AiConfiguration() {
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

  const [page, setPage] = useState(1);
  const [activationRevision, setActivationRevision] = useState<number | null>(
    null
  );
  const [clearAuditRevision, setClearAuditRevision] = useState<number | null>(
    null
  );
  const data = query.data;
  const staleConfirmation =
    !busy &&
    !!data &&
    [draft?.revision, activationRevision, clearAuditRevision].some(
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
    return (
      <div role="status" aria-label="Đang tải cấu hình AI">
        <Skeleton className="h-48 w-full" />
      </div>
    );
  if (!data)
    return (
      <div>
        <Button onClick={() => void query.refetch()}>Tải lại cấu hình</Button>
      </div>
    );
  const current = draft ?? { ...data.settings, revision: data.revision };
  const change = (values: Partial<AiFeatureSettings>) =>
    setDraft({ ...current, ...values });
  const pages = Math.max(1, Math.ceil(data.audit.length / 10));
  const activePage = Math.min(page, pages);
  const semanticReady = data.semanticReady ?? data.vectorReady;
  return (
    <div className="space-y-6">
      {isSuperAdmin && (
        <div className="space-y-3 rounded-xl border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="font-medium">Kích hoạt kết nối AI</p>
              <p className="text-muted-foreground text-sm">
                Kiểm tra dịch vụ và bật trợ lý. Dữ liệu tìm kiếm ngữ nghĩa được
                kích hoạt riêng bên dưới.
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
                dụng hạn mức của nhà cung cấp. Hệ thống chỉ bật AI sau khi kiểm
                tra thành công; không xóa thời gian chờ quota hoặc sửa API key.
              </p>

              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={
                    busy ||
                    data.emergencyDisabled ||
                    activationRevision !== data.revision
                  }
                  onClick={async () => {
                    if (busy) return;
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
              if (busy) return;
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
                      busy ||
                      (key === 'semanticEnabled' &&
                        !semanticReady &&
                        !current.semanticEnabled)
                    }
                    onCheckedChange={(checked) => change({ [key]: checked })}
                  />
                </div>
              ))}
            </div>
            {!semanticReady && (
              <p className="text-muted-foreground text-xs">
                Tìm kiếm ngữ nghĩa cần một phiên bản kiến thức đã sẵn sàng và
                được kích hoạt trong phần Đồng bộ kiến thức bên dưới. Bạn vẫn có
                thể bật trợ lý AI và lưu cấu hình khi tắt Tìm kiếm ngữ nghĩa.
              </p>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={busy || (!!draft && draft.revision !== data.revision)}
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
      <AiEmbeddingVersions
        connections={data.connections}
        encryptionReady={true}
      />
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Lịch sử thay đổi cấu hình</CardTitle>
            {isSuperAdmin && (
              <Button
                variant="outline"
                className="text-destructive"
                disabled={busy || !data.audit.length}
                onClick={() => setClearAuditRevision(data.revision)}
              >
                Xóa lịch sử cấu hình
              </Button>
            )}
          </div>
          <CardDescription>
            Lưu 100 thay đổi gần nhất, hiển thị 10 mục mỗi trang.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuperAdmin && clearAuditRevision !== null && (
            <div
              role="group"
              aria-label="Xác nhận xóa lịch sử cấu hình"
              className="mb-4 space-y-3 rounded-lg border p-4"
            >
              <p className="text-sm">
                Xóa toàn bộ lịch sử thay đổi cấu hình AI? Thao tác không thể
                hoàn tác. Cấu hình vận hành, khóa API, dữ liệu kiến thức và lịch
                sử trò chuyện vẫn được giữ nguyên.
              </p>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="destructive"
                  disabled={busy || clearAuditRevision !== data.revision}
                  onClick={async () => {
                    if (busy) return;
                    setBusy(true);

                    try {
                      const next =
                        await aiSettingsService.clearAudit(clearAuditRevision);
                      client.setQueryData(['ai', 'admin', 'settings'], next);
                      setClearAuditRevision(null);
                      setPage(1);
                      notifySuccess('Đã xóa lịch sử cấu hình AI.');
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
                  {busy ? 'Đang xóa…' : 'Xác nhận xóa lịch sử'}
                </Button>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => setClearAuditRevision(null)}
                >
                  Hủy xóa lịch sử
                </Button>
              </div>
            </div>
          )}
          <Table aria-label="Lịch sử cấu hình AI">
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Thao tác</TableHead>
                <TableHead>Người thực hiện</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.audit
                .slice((activePage - 1) * 10, activePage * 10)
                .map((e, i) => (
                  <TableRow key={`${e.at}:${i}`}>
                    <TableCell>
                      {new Date(e.at).toLocaleString('vi-VN')}
                    </TableCell>
                    <TableCell>{auditLabels[e.action] ?? e.action}</TableCell>
                    <TableCell>{e.actor}</TableCell>
                  </TableRow>
                ))}
              {!data.audit.length && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-muted-foreground py-8 text-center"
                  >
                    Chưa có thay đổi cấu hình.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
            <Button
              variant="outline"
              disabled={activePage <= 1}
              onClick={() => setPage(activePage - 1)}
            >
              Trước
            </Button>
            <span>
              Trang {activePage}/{pages}
            </span>
            <Button
              variant="outline"
              disabled={activePage >= pages}
              onClick={() => setPage(activePage + 1)}
            >
              Sau
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
