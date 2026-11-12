import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ListPagination } from '@/components/list-pagination';
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
import type { AiSettingsData } from '../types/ai-settings';

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

const pageSize = 10;
export function AiSettingsHistory({
  data,
  canManage,
}: {
  data: AiSettingsData;
  canManage: boolean;
}) {
  const client = useQueryClient();
  const [requestedPage, setPage] = useState(1);
  const [confirmation, setConfirmation] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const totalPages = Math.max(1, Math.ceil(data.audit.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const rows = data.audit.slice((page - 1) * pageSize, page * pageSize);
  async function clear() {
    if (!canManage || busy || confirmation === null) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await aiSettingsService.clearAudit(confirmation);
      client.setQueryData(['ai', 'admin', 'settings'], result);
      setPage(1);
      setMessage('Đã xóa lịch sử thay đổi cấu hình.');
    } catch (failure) {
      setError(getApiError(failure).message);
      // A stale confirmation must never clear newly appended audit entries.
      await client
        .invalidateQueries({
          queryKey: ['ai', 'admin', 'settings'],
          exact: true,
        })
        .catch(() => {});
    } finally {
      setConfirmation(null);
      setBusy(false);
    }
  }
  return (
    <Card role="region" aria-label="Lịch sử thay đổi cấu hình">
      <CardHeader className="flex flex-wrap items-start justify-between gap-3 sm:flex-row">
        <div className="space-y-1">
          <CardTitle>Lịch sử thay đổi cấu hình</CardTitle>
          <CardDescription>
            Tối đa 100 thay đổi gần đây, mỗi trang 10 mục; không ghi giá trị API
            key.
          </CardDescription>
        </div>
        {canManage && (
          <Button
            type="button"
            variant="outline"
            disabled={busy || !data.audit.length}
            onClick={() => {
              setConfirmation(data.revision);
              setError('');
              setMessage('');
            }}
          >
            <Trash2 aria-hidden="true" />
            Xóa lịch sử
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {confirmation !== null && canManage && (
          <div
            className="mb-4 space-y-3 rounded-lg border p-4"
            role="group"
            aria-label="Xác nhận xóa lịch sử"
          >
            <p>
              Xóa toàn bộ lịch sử thay đổi cấu hình? Cấu hình, kết nối và dữ
              liệu embeddings được giữ nguyên.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="destructive"
                disabled={busy}
                onClick={() => void clear()}
              >
                {busy ? 'Đang xóa…' : 'Xác nhận xóa lịch sử'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setConfirmation(null)}
              >
                Hủy
              </Button>
            </div>
          </div>
        )}
        {error && (
          <p role="alert" className="text-destructive mb-3 text-sm">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="mb-3 text-sm">
            {message}
          </p>
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
            {rows.map((entry, index) => (
              <TableRow key={`${entry.at}-${(page - 1) * pageSize + index}`}>
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
        {data.audit.length > pageSize && (
          <ListPagination
            label="Phân trang lịch sử cấu hình AI"
            page={page}
            totalPages={totalPages}
            disabled={busy}
            onPageChange={setPage}
          />
        )}
      </CardContent>
    </Card>
  );
}
