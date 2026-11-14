import { LoadingSkeleton } from '@/components/loading-skeleton';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Database, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import { aiEmbeddingsService } from '../services/ai-embeddings.service';
import type { AiConnection } from '../types/ai-settings';
import type {
  EmbeddingVersionInput,
  EmbeddingVersionsData,
} from '../types/ai-embeddings';

const labels = {
  queued: 'Đang chờ',
  building: 'Đang tạo embeddings',
  verifying: 'Đang xác nhận index',
  ready: 'Sẵn sàng',
  failed: 'Thất bại',
  cancelled: 'Đã hủy',
};
const failureDescriptions: Record<string, string> = {
  AI_INDEX_INTERRUPTED:
    'Tác vụ đã tạm dừng khi máy chủ dừng hoặc khởi động lại. Worker sẽ tự tiếp tục.',
  AI_VECTOR_CAPACITY:
    'Vượt quá 5.000 đoạn kiến thức. Hãy tạo phiên bản dùng Atlas Vector Search.',
  AI_VECTOR_INDEX_PENDING:
    'Đang chờ index tạo xong hoặc dữ liệu được đưa vào index. Worker sẽ kiểm tra lại.',
  AI_VECTOR_INDEX_ERROR:
    'Không tạo hoặc truy vấn được index. Kiểm tra cấu hình tìm kiếm và quyền kết nối dữ liệu.',
  AI_USAGE_LIMIT:
    'Tác vụ bị tạm dừng bởi giới hạn cũ của ứng dụng. Worker sẽ tự tiếp tục ở lần kiểm tra kế tiếp khi AI và đồng bộ được bật.',
  AI_CREDIT_EXHAUSTED: 'Tài khoản nhà cung cấp không còn hạn mức khả dụng.',
  AI_RATE_LIMITED: 'Nhà cung cấp đang giới hạn yêu cầu. Hãy thử lại sau.',
};
const field =
  'bg-background border-input h-9 w-full rounded-lg border px-3 text-sm';
export function AiEmbeddingVersions({
  connections,
  encryptionReady,
  canManage = false,
}: {
  connections: AiConnection[];
  encryptionReady: boolean;
  canManage?: boolean;
}) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['ai', 'admin', 'embeddings'],
    queryFn: aiEmbeddingsService.read,
    refetchInterval: 15000,
  });
  const [draft, setDraft] = useState<EmbeddingVersionInput | null>(null);
  const [confirm, setConfirm] = useState<{
    action: 'activate' | 'legacy' | 'retry' | 'cancel' | 'delete';
    id: string;
    revision: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const data = query.data;
  const activeVersion = data?.versions.find(
    (version) => version._id === data.activeId
  );
  const eligible = connections.filter((connection) => connection.checkedOk);
  const options = data?.supportedModels ?? [];
  const selected = options.find((item) => item.model === draft?.model);
  const defaultOption = options.find((item) => item.available);
  async function execute(
    work: () => Promise<EmbeddingVersionsData>,
    text: string
  ) {
    if (busy || !canManage) return false;
    setBusy(true);

    try {
      const result = await work();
      client.setQueryData(['ai', 'admin', 'embeddings'], result);
      await client.invalidateQueries({ queryKey: ['ai', 'admin'] });
      toast.success(text);
      return true;
    } catch (failure) {
      const text = getApiError(failure).message;
      toast.error(text);
      if (getApiError(failure).statusCode === 409) {
        setConfirm(null);
        setDraft(null);
        await client.invalidateQueries({ queryKey: ['ai', 'admin'] });
      }
      return false;
    } finally {
      setBusy(false);
    }
  }
  const workerNotice =
    data &&
    data.versions.some((version) =>
      ['queued', 'building', 'verifying'].includes(version.state)
    )
      ? data.worker?.emergencyDisabled
        ? 'Máy chủ đang bật AI_FORCE_DISABLED. Cần tắt chế độ dừng khẩn cấp để đồng bộ.'
        : data.worker && !data.worker.running
          ? 'Worker đồng bộ chưa chạy trên máy chủ này. Khởi động lại BE bằng pnpm dev hoặc pnpm start sau khi build.'
          : data.worker &&
              (!data.worker.enabled || !data.worker.indexingEnabled)
            ? 'Chưa thể đồng bộ: hãy bật trợ lý AI và tự động đồng bộ kiến thức, rồi lưu cấu hình.'
            : data.worker?.lastErrorCode
              ? 'Tác vụ chưa xử lý được hàng đợi. Kiểm tra kết nối MongoDB và khóa API của nhà cung cấp embedding trên máy chủ.'
              : 'Phiên bản đang chờ worker tạo và xác nhận embeddings. Tạo phiên bản chưa bật tìm kiếm ngữ nghĩa; khi Sẵn sàng, hãy chọn Dùng phiên bản này.'
      : null;
  useEffect(() => {
    if (workerNotice)
      toast.info(workerNotice, { id: 'ai-admin-worker-status' });
    else toast.dismiss('ai-admin-worker-status');
  }, [workerNotice]);
  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-3 sm:flex-row">
        <div className="space-y-1">
          <CardTitle>Đồng bộ kiến thức</CardTitle>
          <CardDescription>
            Quản lý các phiên bản kiến thức dùng cho tìm kiếm ngữ nghĩa. Chỉ
            kích hoạt phiên bản đã sẵn sàng; có thể quay lại phiên bản cũ.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          disabled={
            busy ||
            !canManage ||
            !encryptionReady ||
            !data ||
            !defaultOption ||
            data.versions.length >= 20
          }
          onClick={() => {
            const connection = eligible.find(
              (item) => item.provider === defaultOption!.provider
            )!;
            setDraft({
              revision: data!.revision,
              connectionId: connection.id,
              model: defaultOption!.model,
              dimensions: defaultOption!.dimensions.includes(1536)
                ? 1536
                : defaultOption!.dimensions[0]!,
              engine: 'exact',
              startSync: true,
            });
          }}
        >
          <Plus aria-hidden="true" />
          Tạo phiên bản embeddings
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {query.isPending && (
          <LoadingSkeleton
            label="Đang tải phiên bản embeddings…"
            variant="table"
          />
        )}
        <p className="text-muted-foreground text-sm">
          Chọn MongoDB thông thường cho cửa hàng nhỏ (tối đa 5.000 đoạn kiến
          thức), hoặc Atlas Vector Search cho dữ liệu lớn. Worker chạy khi bật
          AI và đồng bộ tự động; tác vụ sử dụng hạn mức embeddings và có thể
          phát sinh phí dịch vụ. Embeddings sử dụng model đã chọn độc lập với
          model chat.
        </p>
        {!eligible.length && (
          <p className="text-muted-foreground text-sm">
            Hãy cấu hình khóa API của nhà cung cấp embedding trong .env của
            backend trước.
          </p>
        )}
        <p className="text-muted-foreground text-sm">
          Đồng bộ kiểm tra thay đổi mỗi 15 phút, chỉ tạo phiên bản khi dữ liệu
          thay đổi và chỉ gọi embeddings cho nội dung mới hoặc đã sửa. Website
          không đặt hạn mức gọi API theo ngày; quota của nhà cung cấp vẫn áp
          dụng cho cả chat và đồng bộ. Phiên bản tự động dùng MongoDB cosine cũ
          được dọn khi đầy 20 phiên bản, sau thời gian bảo vệ 5 phút; phiên bản
          tạo thủ công được giữ lại. Sau khi hủy, chọn Đồng bộ kiến thức để tiếp
          tục cùng phiên bản.
        </p>
        {data && (
          <>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Database
                className="text-muted-foreground size-4"
                aria-hidden="true"
              />
              <span>
                {data.activeId
                  ? `Phiên bản đang dùng: ${activeVersion?.model ?? 'Đang cập nhật thông tin'}`
                  : 'Đang dùng cấu hình embeddings môi trường / tìm kiếm từ khóa'}
              </span>
              {data.activeId && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy || !canManage}
                  onClick={() =>
                    setConfirm({
                      action: 'legacy',
                      id: '',
                      revision: data.revision,
                    })
                  }
                >
                  Ngừng dùng phiên bản
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                disabled={query.isFetching}
                onClick={() => void query.refetch()}
              >
                Cập nhật phiên bản
              </Button>
            </div>
            {draft && (
              <form
                className="grid gap-4 rounded-lg border p-4 sm:grid-cols-3"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (
                    await execute(
                      () => aiEmbeddingsService.create(draft),
                      'Đã xếp lịch phiên bản mới. Nếu đã chọn bật đồng bộ, worker bắt đầu trong vòng một phút khi AI đang bật. Khi trạng thái Sẵn sàng, chọn Dùng phiên bản này để bật tìm kiếm ngữ nghĩa.'
                    )
                  )
                    setDraft(null);
                }}
              >
                <div className="space-y-2 sm:col-span-3">
                  <Label htmlFor="embedding-engine">
                    Cách tìm kiếm ngữ nghĩa
                  </Label>
                  <select
                    id="embedding-engine"
                    className={field}
                    value={draft.engine ?? 'atlas'}
                    disabled={busy || !canManage}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        engine: event.target.value as 'exact' | 'atlas',
                      })
                    }
                  >
                    <option value="exact">
                      MongoDB thông thường — cosine, tối đa 5.000 đoạn
                    </option>
                    <option value="atlas">
                      Atlas Vector Search — cần quyền tạo search index
                    </option>
                  </select>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.startSync ?? false}
                      disabled={busy || !canManage}
                      onChange={(event) =>
                        setDraft({ ...draft, startSync: event.target.checked })
                      }
                    />
                    Bật đồng bộ tự động sau khi tạo (cần bật trợ lý AI)
                  </label>
                </div>
                <p className="text-muted-foreground text-sm">
                  Dữ liệu ngữ nghĩa dùng model embedding đã chọn, độc lập với
                  model chat.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="embedding-model">
                    Nhà cung cấp / model embedding
                  </Label>
                  <select
                    id="embedding-model"
                    className={field}
                    required
                    disabled={busy || !canManage}
                    value={draft.model}
                    onChange={(event) => {
                      const option = options.find(
                        (item) => item.model === event.target.value
                      )!;
                      const connection = eligible.find(
                        (item) => item.provider === option.provider
                      )!;
                      setDraft({
                        ...draft,
                        model: option.model,
                        connectionId: connection.id,
                        dimensions: option.dimensions.includes(draft.dimensions)
                          ? draft.dimensions
                          : option.dimensions[0]!,
                      });
                    }}
                  >
                    {options.map((item) => (
                      <option
                        key={`${item.provider}:${item.model}`}
                        value={item.model}
                        disabled={!item.available}
                      >
                        {item.provider} — {item.model}
                        {item.available ? '' : ' (Chưa cấu hình)'}
                      </option>
                    ))}
                  </select>
                  <p className="text-muted-foreground text-xs">
                    Mỗi phiên bản giữ riêng nhà cung cấp, model và số chiều.
                    Thay đổi model cần tạo phiên bản mới.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="embedding-dimensions">Số chiều vector</Label>
                  <select
                    id="embedding-dimensions"
                    className={field}
                    disabled={busy || !canManage}
                    value={draft.dimensions}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        dimensions: Number(event.target.value),
                      })
                    }
                  >
                    {(selected?.dimensions ?? []).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-muted-foreground text-xs sm:col-span-3">
                  Mỗi phiên bản tạo dữ liệu và index riêng trong
                  ai_embedding_chunks, không ghi đè index hiện tại. Tối đa 20
                  phiên bản được lưu.
                </p>
                <div className="flex gap-2 sm:col-span-3">
                  <Button type="submit" disabled={busy || !canManage}>
                    {busy ? 'Đang tạo…' : 'Xếp lịch đồng bộ phiên bản'}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    disabled={busy || !canManage}
                    onClick={() => setDraft(null)}
                  >
                    Hủy tạo phiên bản
                  </Button>
                </div>
              </form>
            )}
            {confirm && (
              <div
                role="group"
                aria-label="Xác nhận thao tác embeddings"
                className="space-y-3 rounded-lg border p-4"
              >
                <p className="text-sm">
                  {confirm.action === 'activate'
                    ? 'Chuyển các yêu cầu mới sang phiên bản này? Phiên bản hiện tại được giữ lại để quay về.'
                    : confirm.action === 'legacy'
                      ? 'Ngừng dùng phiên bản và tắt tìm kiếm ngữ nghĩa, đồng bộ tự động? Dữ liệu cũ vẫn được giữ.'
                      : confirm.action === 'delete'
                        ? 'Xóa dữ liệu của phiên bản không còn sử dụng? Thao tác này không thể hoàn tác. Search index được giữ để kiểm tra và dọn riêng trên MongoDB.'
                        : confirm.action === 'retry'
                          ? 'Thử lại đồng bộ / xác nhận index? Phần embeddings chưa hoàn tất có thể sử dụng thêm hạn mức API.'
                          : 'Hủy phần công việc còn lại của phiên bản này? Các API call đã bắt đầu vẫn có thể tính vào hạn mức.'}
                </p>
                <div className="flex gap-2">
                  <Button
                    disabled={busy || !canManage}
                    variant={
                      confirm.action === 'delete' ? 'destructive' : 'default'
                    }
                    onClick={async () => {
                      const value = confirm;
                      const ok = await execute(
                        () =>
                          value.action === 'activate' ||
                          value.action === 'legacy'
                            ? aiEmbeddingsService.activate(
                                value.action === 'legacy' ? null : value.id,
                                value.revision
                              )
                            : aiEmbeddingsService.change(
                                value.id,
                                value.revision,
                                value.action
                              ),
                        {
                          delete: 'Đã xóa phiên bản embedding.',
                          cancel: 'Đã hủy đồng bộ phiên bản embedding.',
                          retry:
                            'Đã xếp lịch thử lại đồng bộ phiên bản embedding.',
                          activate: 'Đã kích hoạt phiên bản embedding.',
                          legacy: 'Đã ngừng sử dụng phiên bản embedding.',
                        }[value.action]
                      );
                      if (ok) setConfirm(null);
                    }}
                  >
                    {busy ? 'Đang xử lý…' : 'Xác nhận phiên bản'}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={busy || !canManage}
                    onClick={() => setConfirm(null)}
                  >
                    Hủy thao tác phiên bản
                  </Button>
                </div>
              </div>
            )}
            <Table aria-label="Phiên bản embeddings">
              <TableHeader>
                <TableRow>
                  <TableHead>Model embedding</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Đã xác nhận / Tổng đoạn</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.versions.map((version) => (
                  <TableRow key={version._id}>
                    <TableCell>
                      <p className="max-w-64 font-medium break-all">
                        {version.model}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {new Date(version.createdAt).toLocaleString('vi-VN')}
                        {version.autoActivate ? ' · Đồng bộ định kỳ' : ''}
                      </p>
                      {data.activeId === version._id && (
                        <Badge className="mt-2" variant="secondary">
                          Đang sử dụng
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          version.state === 'failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {labels[version.state]}
                      </Badge>
                      {version.failureCode && (
                        <p className="text-muted-foreground mt-2 text-xs">
                          {failureDescriptions[version.failureCode] ??
                            'Chưa thể hoàn tất tác vụ. Kiểm tra cấu hình và thử lại.'}{' '}
                          ({version.failureCode})
                        </p>
                      )}
                      {version.failureCode &&
                        version.nextRunAt &&
                        ['queued', 'building', 'verifying'].includes(
                          version.state
                        ) && (
                          <p className="text-muted-foreground mt-2 text-xs">
                            Tự kiểm tra lại:{' '}
                            {new Date(version.nextRunAt).toLocaleString(
                              'vi-VN'
                            )}
                          </p>
                        )}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {version.verified} / {version.chunks}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          disabled={
                            busy ||
                            !canManage ||
                            !options.some(
                              (item) =>
                                item.provider === version.provider &&
                                item.model === version.model &&
                                item.available
                            ) ||
                            version.state !== 'ready' ||
                            data.activeId === version._id
                          }
                          onClick={() =>
                            setConfirm({
                              action: 'activate',
                              id: version._id,
                              revision: data.revision,
                            })
                          }
                        >
                          Dùng phiên bản này
                        </Button>
                        {data.activeId !== version._id &&
                          (['queued', 'building', 'verifying'].includes(
                            version.state
                          ) ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busy || !canManage}
                              onClick={() =>
                                setConfirm({
                                  action: 'cancel',
                                  id: version._id,
                                  revision: data.revision,
                                })
                              }
                            >
                              Hủy đồng bộ
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={
                                  busy ||
                                  !canManage ||
                                  !options.some(
                                    (item) =>
                                      item.provider === version.provider &&
                                      item.model === version.model &&
                                      item.available
                                  ) ||
                                  !eligible.length
                                }
                                onClick={() =>
                                  setConfirm({
                                    action: 'retry',
                                    id: version._id,
                                    revision: data.revision,
                                  })
                                }
                              >
                                Thử lại / xác nhận
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy || !canManage}
                                onClick={() =>
                                  setConfirm({
                                    action: 'delete',
                                    id: version._id,
                                    revision: data.revision,
                                  })
                                }
                              >
                                Xóa phiên bản
                              </Button>
                            </>
                          ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!data.versions.length && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground h-24 text-center"
                    >
                      Chưa có phiên bản embeddings.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}
