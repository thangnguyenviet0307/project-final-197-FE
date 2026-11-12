import { AiEmbeddingVersions } from './ai-embedding-versions';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  TableBody,
  TableHead,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { getApiError } from '@/services/api';
import { aiSettingsService } from '../services/ai-settings.service';
import type {
  AiConnection,
  AiFeatureSettings,
  AiSettingsData,
} from '../types/ai-settings';

const providerLabels = {
  gemini: 'Google Gemini',
  openai: 'OpenAI',
  xai: 'xAI (Grok)',
};
type ConnectionDraft = {
  provider: AiConnection['provider'];
  id?: string;
  revision: number;
  name: string;
  model: string;
  apiKey: string;
};
const fieldClass =
  'bg-background border-input h-9 w-full rounded-lg border px-3 text-sm';
const actions: Record<string, string> = {
  'settings.initialized': 'Nhập cấu hình môi trường',
  'connection.created': 'Thêm kết nối',
  'connection.updated': 'Sửa kết nối',
  'connection.deleted': 'Xóa kết nối',
  'connection.tested': 'Kiểm tra kết nối',
  'settings.updated': 'Cập nhật vận hành',
  'embedding.created': 'Tạo phiên bản embeddings',
  'embedding.activated': 'Chuyển phiên bản embeddings',
  'embedding.legacy': 'Ngừng dùng phiên bản embeddings',
  'embedding.retry': 'Thử lại phiên bản embeddings',
  'embedding.cancel': 'Hủy đồng bộ embeddings',
  'embedding.delete': 'Xóa phiên bản embeddings',
};

export function AiConfiguration({
  canManage = false,
}: {
  canManage?: boolean;
}) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['ai', 'admin', 'settings'],
    queryFn: aiSettingsService.read,
    refetchInterval: 15000,
  });
  const [form, setForm] = useState<ConnectionDraft | null>(null);
  const [draft, setDraft] = useState<
    (AiFeatureSettings & { revision: number }) | null
  >(null);
  const [confirm, setConfirm] = useState<{
    action: 'delete' | 'test';
    connection: AiConnection;
    revision: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const data = query.data;
  // Credential writes bypass mutation caches so API keys are not retained in mutation variables.
  async function execute(
    action: () => Promise<AiSettingsData>,
    success: string
  ) {
    if (busy || !canManage) return false;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await action();
      client.setQueryData(['ai', 'admin', 'settings'], result);
      await client.invalidateQueries({
        queryKey: ['ai', 'admin'],
        exact: true,
      });
      setMessage(success);
      return true;
    } catch (failure) {
      setError(getApiError(failure).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  if (query.isPending) return <p role="status">Đang tải cấu hình AI…</p>;
  if (!data)
    return (
      <div role="alert">
        <p>{getApiError(query.error).message}</p>
        <Button variant="outline" onClick={() => void query.refetch()}>
          Tải lại cấu hình
        </Button>
      </div>
    );
  const current = draft ?? { ...data.settings, revision: data.revision };
  const disabled = busy || !data.encryptionReady;
  const change = (values: Partial<AiFeatureSettings>) =>
    setDraft({ ...current, ...values });
  return (
    <fieldset disabled={!canManage} className="min-w-0 space-y-6">
      {message && (
        <p role="status" className="rounded-lg border p-3 text-sm">
          {message}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="text-destructive rounded-lg border p-3 text-sm"
        >
          {error}
        </p>
      )}
      {!data.encryptionReady && (
        <p
          role="alert"
          className="text-destructive rounded-lg border p-4 text-sm"
        >
          Máy chủ chưa có AI_CONFIG_ENCRYPTION_KEY hợp lệ. Cần cấu hình khóa mã
          hóa trước khi lưu API key trên web.
        </p>
      )}
      {data.emergencyDisabled && (
        <p role="alert">
          AI đang bị tắt khẩn cấp trên máy chủ. Các thay đổi trên web không thể
          vượt qua công tắc này.
        </p>
      )}
      <Card>
        <CardHeader className="flex flex-wrap items-start justify-between gap-3 sm:flex-row">
          <div className="space-y-1">
            <CardTitle>Kết nối & model AI</CardTitle>
            <CardDescription>
              Gemini, OpenAI và xAI (Grok). API key được mã hóa và chỉ hiển thị
              bốn ký tự cuối.
            </CardDescription>
          </div>
          <Button
            disabled={disabled}
            onClick={() => {
              setForm({
                revision: data.revision,
                name: '',
                model: data.suggestedModels[0] ?? 'gemini-3.1-flash-lite',
                provider: 'gemini',
                apiKey: '',
              });
              setConfirm(null);
            }}
          >
            <Plus aria-hidden="true" /> Thêm kết nối
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.source === 'environment' && (
            <div className="space-y-3 rounded-lg border p-4">
              <p className="text-muted-foreground text-sm">
                Hiện dùng cấu hình môi trường. Nhập cấu hình hiện tại để quản lý
                các công tắc trên web; API key cũ được mã hóa tự động, không cần
                nhập lại. Bạn cũng có thể thêm kết nối mới ngay.
              </p>
              <Button
                variant="outline"
                disabled={disabled}
                onClick={() => {
                  void execute(
                    () => aiSettingsService.initialize(data.revision),
                    'Đã nhập cấu hình môi trường.'
                  );
                }}
              >
                Nhập cấu hình hiện tại
              </Button>
            </div>
          )}
          <Table aria-label="Kết nối AI">
            <TableHeader>
              <TableRow>
                <TableHead>Tên / Nhà cung cấp</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>API key</TableHead>
                <TableHead>Kiểm tra</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.connections.map((connection) => (
                <TableRow key={connection.id}>
                  <TableCell>
                    <p className="font-medium">{connection.name}</p>
                    <span className="text-muted-foreground text-xs">
                      {providerLabels[connection.provider]}
                    </span>
                    {data.settings.activeConnectionId === connection.id && (
                      <Badge className="ml-2" variant="secondary">
                        Đang chọn
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="break-all">
                    {connection.model}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2 font-mono">
                      <KeyRound className="size-3" aria-hidden="true" />
                      ••••{connection.keyHint}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        connection.checkedOk
                          ? 'secondary'
                          : connection.checkedAt
                            ? 'destructive'
                            : 'outline'
                      }
                    >
                      {connection.checkedOk
                        ? 'Kết nối thành công'
                        : connection.checkedAt
                          ? 'Kiểm tra thất bại'
                          : 'Chưa kiểm tra'}
                    </Badge>
                    {connection.checkCode && !connection.checkedOk && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        {connection.checkCode}
                      </p>
                    )}
                    {connection.checkedAt && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        {new Date(connection.checkedAt).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={disabled}
                        onClick={() =>
                          setConfirm({
                            action: 'test',
                            connection,
                            revision: data.revision,
                          })
                        }
                      >
                        Kiểm tra
                      </Button>
                      <Button
                        size="sm"
                        disabled={
                          disabled ||
                          !connection.checkedOk ||
                          data.settings.activeConnectionId === connection.id
                        }
                        onClick={() => {
                          void execute(
                            () =>
                              aiSettingsService.save({
                                ...data.settings,
                                revision: data.revision,
                                activeConnectionId: connection.id,
                                enabled: true,
                              }),
                            'Đã kích hoạt kết nối cho các yêu cầu mới.'
                          );
                        }}
                      >
                        Kích hoạt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          disabled ||
                          data.settings.activeConnectionId === connection.id
                        }
                        onClick={() => {
                          setConfirm(null);
                          setForm({
                            id: connection.id,
                            revision: data.revision,
                            name: connection.name,
                            model: connection.model,
                            provider: connection.provider,
                            apiKey: '',
                          });
                        }}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          disabled ||
                          data.settings.activeConnectionId === connection.id
                        }
                        onClick={() =>
                          setConfirm({
                            action: 'delete',
                            connection,
                            revision: data.revision,
                          })
                        }
                      >
                        Xóa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!data.connections.length && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground h-24 text-center"
                  >
                    Chưa có kết nối được lưu trên web.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <p className="text-muted-foreground text-xs">
            Muốn sửa hoặc xóa kết nối đang chọn, hãy chọn kết nối khác hoặc chọn
            “Không dùng kết nối” rồi lưu phần vận hành bên dưới. Kiểm tra lại
            sau khi thay model/API key.
          </p>
          {confirm && (
            <div
              role="group"
              aria-label="Xác nhận thao tác kết nối"
              className="space-y-3 rounded-lg border p-4"
            >
              <p>
                {confirm.action === 'delete'
                  ? `Xóa kết nối “${confirm.connection.name}” và API key đã lưu?`
                  : `Kiểm tra “${confirm.connection.name}” sẽ gọi model thật để thử JSON và streaming, sử dụng tối đa 2 lượt API. Nhà cung cấp có thể tính phí theo tài khoản của bạn.`}
              </p>
              <div className="flex gap-2">
                <Button
                  disabled={busy}
                  variant={
                    confirm.action === 'delete' ? 'destructive' : 'default'
                  }
                  onClick={async () => {
                    const target = confirm;
                    const ok = await execute(
                      () =>
                        target.action === 'delete'
                          ? aiSettingsService.remove(
                              target.connection.id,
                              target.revision
                            )
                          : aiSettingsService.test(
                              target.connection.id,
                              target.revision
                            ),
                      target.action === 'delete'
                        ? 'Đã xóa kết nối.'
                        : 'Đã kiểm tra. Xem kết quả trong danh sách kết nối.'
                    );
                    if (ok) setConfirm(null);
                  }}
                >
                  {busy
                    ? 'Đang xử lý…'
                    : confirm.action === 'delete'
                      ? 'Xác nhận xóa'
                      : 'Chạy kiểm tra'}
                </Button>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => setConfirm(null)}
                >
                  Hủy
                </Button>
              </div>
            </div>
          )}
          {form && (
            <form
              className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2"
              onSubmit={async (event) => {
                event.preventDefault();
                const submitted = form;
                const ok = await execute(
                  () =>
                    aiSettingsService.connection(
                      {
                        revision: submitted.revision,
                        name: submitted.name.trim(),
                        provider: submitted.provider,
                        model: submitted.model.trim(),
                        ...(submitted.apiKey.trim()
                          ? { apiKey: submitted.apiKey.trim() }
                          : {}),
                      },
                      submitted.id
                    ),
                  'Đã lưu kết nối. Hãy kiểm tra trước khi kích hoạt.'
                );
                if (ok) setForm(null);
              }}
            >
              <h3 className="font-semibold sm:col-span-2">
                {form.id ? 'Chỉnh sửa kết nối' : 'Kết nối mới'}
              </h3>
              <div className="space-y-2">
                <Label htmlFor="ai-connection-name">Tên kết nối</Label>
                <Input
                  id="ai-connection-name"
                  required
                  maxLength={80}
                  value={form.name}
                  disabled={busy}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-provider">Nhà cung cấp</Label>
                <select
                  id="ai-provider"
                  className={fieldClass}
                  disabled={busy}
                  value={form.provider}
                  onChange={(event) => {
                    const provider = event.target
                      .value as AiConnection['provider'];
                    setForm({
                      ...form,
                      provider,
                      apiKey: '',
                      model:
                        data.providerModels?.[provider]?.[0] ??
                        (provider === 'gemini'
                          ? (data.suggestedModels[0] ?? '')
                          : ''),
                    });
                  }}
                >
                  {Object.entries(providerLabels).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
                <Label htmlFor="ai-connection-model">Model trả lời</Label>
                <Input
                  id="ai-connection-model"
                  list="ai-model-options"
                  required
                  pattern={
                    form.provider === 'gemini'
                      ? 'gemini-[a-zA-Z0-9._-]+'
                      : form.provider === 'openai'
                        ? 'gpt-[a-zA-Z0-9._-]+'
                        : 'grok-[a-zA-Z0-9._-]+'
                  }
                  maxLength={107}
                  value={form.model}
                  disabled={busy}
                  onChange={(event) =>
                    setForm({ ...form, model: event.target.value })
                  }
                />
                <datalist id="ai-model-options">
                  {(
                    data.providerModels?.[form.provider] ??
                    (form.provider === 'gemini' ? data.suggestedModels : [])
                  ).map((model) => (
                    <option key={model} value={model} />
                  ))}
                </datalist>
                <p className="text-muted-foreground text-xs">
                  Chọn gợi ý hoặc nhập mã model của nhà cung cấp có hỗ trợ JSON
                  và streaming.
                </p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="ai-connection-key">
                  API key {form.id && '(để trống nếu giữ nguyên)'}
                </Label>
                <Input
                  id="ai-connection-key"
                  type="password"
                  autoComplete="new-password"
                  required={
                    !form.id ||
                    data.connections.find((item) => item.id === form.id)
                      ?.provider !== form.provider
                  }
                  minLength={12}
                  maxLength={1024}
                  value={form.apiKey}
                  disabled={busy}
                  onChange={(event) =>
                    setForm({ ...form, apiKey: event.target.value })
                  }
                />
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={disabled}>
                  {busy ? 'Đang lưu…' : 'Lưu kết nối'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => setForm(null)}
                >
                  Hủy chỉnh sửa
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Điều khiển vận hành</CardTitle>
          <CardDescription>
            Áp dụng cho yêu cầu mới; tác vụ đang chạy giữ cấu hình ban đầu.
            Phiên bản {data.revision}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={async (event) => {
              event.preventDefault();
              if (
                await execute(
                  () => aiSettingsService.save(current),
                  'Đã cập nhật cấu hình vận hành.'
                )
              )
                setDraft(null);
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ai-active-connection">Kết nối đang dùng</Label>
                <select
                  id="ai-active-connection"
                  className={fieldClass}
                  disabled={disabled}
                  value={current.activeConnectionId ?? ''}
                  onChange={(event) =>
                    change({
                      activeConnectionId: event.target.value || null,
                      ...(!event.target.value ? { enabled: false } : {}),
                    })
                  }
                >
                  <option value="">Không dùng kết nối</option>
                  {data.connections.map((connection) => (
                    <option key={connection.id} value={connection.id}>
                      {connection.name} · {connection.model}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-daily-limit">
                  Giới hạn lượt gọi / ngày UTC
                </Label>
                <Input
                  id="ai-daily-limit"
                  type="number"
                  min={1}
                  max={100000}
                  required
                  disabled={disabled}
                  value={current.dailyCalls}
                  onChange={(event) =>
                    change({ dailyCalls: Number(event.target.value) })
                  }
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  [
                    'enabled',
                    'Bật trợ lý AI',
                    'Cho phép phân tích câu hỏi và trả lời.',
                  ],
                  [
                    'semanticEnabled',
                    'Tìm kiếm ngữ nghĩa',
                    'Tìm theo ý nghĩa bằng phiên bản embeddings đã kích hoạt.',
                  ],
                  [
                    'indexingEnabled',
                    'Đồng bộ kiến thức tự động',
                    'Cho phép worker cập nhật embeddings định kỳ.',
                  ],
                  [
                    'riskEnabled',
                    'Theo dõi rủi ro',
                    'Ghi nhận tín hiệu đăng nhập và checkout theo quy tắc.',
                  ],
                ] as const
              ).map(([key, label, description]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 rounded-lg border p-4"
                >
                  <div>
                    <Label htmlFor={`ai-feature-${key}`}>{label}</Label>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {description}
                    </p>
                  </div>
                  <Switch
                    id={`ai-feature-${key}`}
                    checked={current[key]}
                    disabled={
                      disabled ||
                      (key === 'semanticEnabled'
                        ? !(data.semanticReady ?? data.vectorReady)
                        : key === 'indexingEnabled' && !data.vectorReady)
                    }
                    onCheckedChange={(checked) => change({ [key]: checked })}
                  />
                </div>
              ))}
            </div>
            {!data.vectorReady && (
              <p className="text-muted-foreground text-sm">
                Thiết lập lần đầu: kiểm tra kết nối Gemini/OpenAI ở trên, tạo
                phiên bản embeddings bên dưới và chọn bật đồng bộ tự động. Khi
                phiên bản sẵn sàng, chọn Dùng phiên bản này để bật tìm kiếm ngữ
                nghĩa. Có thể dùng MongoDB thông thường mà không cần
                AI_VECTOR_INDEX trong môi trường.
              </p>
            )}
            {draft && draft.revision !== data.revision && (
              <p role="alert">
                Cấu hình đã được người khác thay đổi. Hủy thay đổi để tải phiên
                bản mới trước khi lưu.
              </p>
            )}
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={
                  disabled ||
                  data.source === 'environment' ||
                  (draft !== null && draft.revision !== data.revision)
                }
              >
                {busy ? 'Đang lưu…' : 'Lưu vận hành'}
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
        canManage={canManage}
        connections={data.connections}
        encryptionReady={data.encryptionReady}
      />
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử thay đổi cấu hình</CardTitle>
          <CardDescription>
            Tối đa 100 thay đổi gần đây, không ghi giá trị API key.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table aria-label="Lịch sử cấu hình AI">
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Thao tác</TableHead>
                <TableHead>Người thực hiện</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.audit.map((entry, index) => (
                <TableRow key={`${entry.at}-${index}`}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(entry.at).toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell>{actions[entry.action] ?? entry.action}</TableCell>
                  <TableCell className="font-mono text-xs break-all">
                    {entry.actor}
                  </TableCell>
                </TableRow>
              ))}
              {!data.audit.length && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-muted-foreground h-20 text-center"
                  >
                    Chưa có thay đổi cấu hình trên web.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </fieldset>
  );
}
