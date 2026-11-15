import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ListPagination } from '@/components/list-pagination';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useAiAdminRecords } from '../hooks/use-ai-admin-records';
import type { AiAdminRecord, AiRecordKind } from '../types/ai-admin-records';

const sections = {
  failures: {
    title: 'Lỗi trả lời gần đây',
    description:
      'Các lượt trả lời thất bại để kiểm tra nguyên nhân và hỗ trợ vận hành.',
    columns: ['Thời gian', 'Mã lỗi', 'Giai đoạn', 'Thông báo'],
    empty: 'Chưa ghi nhận lỗi trả lời.',
  },
  usage: {
    title: 'Lượt gọi nhà cung cấp',
    description:
      'Số lượt gọi API theo ngày UTC, gồm cả các lần gọi thất bại. Xóa bản ghi chỉ xóa số liệu thống kê.',
    columns: ['Ngày (UTC)', 'Số lượt gọi'],
    empty: 'Chưa có dữ liệu lượt gọi.',
  },
  risks: {
    title: 'Cảnh báo rủi ro theo quy tắc',
    description:
      'Các tín hiệu cần xem xét; hệ thống không tự kết luận gian lận hoặc khóa tài khoản.',
    columns: ['Thời gian', 'Sự kiện', 'Lý do', 'Điểm'],
    empty: 'Chưa có cảnh báo.',
  },
};
const translations: Record<string, string> = {
  usage_limit: 'Giới hạn sử dụng',
  'Rate or daily AI budget exceeded':
    'Vượt giới hạn tần suất hoặc hạn mức AI cũ.',
  intent: 'Phân tích nhu cầu',
  answer: 'Soạn câu trả lời',
  retrieval: 'Tìm kiếm kiến thức',
  stream: 'Truyền câu trả lời',
};
const translated = (value?: string) =>
  value ? (translations[value] ?? value) : '—';
const dateTime = (value?: string) =>
  value ? new Date(value).toLocaleString('vi-VN') : '—';

export function AiAdminRecordsSection({
  kind,
  canManage,
}: {
  kind: AiRecordKind;
  canManage: boolean;
}) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AiAdminRecord | null>(null);
  const { query, remove } = useAiAdminRecords(kind, page);
  const section = sections[kind];
  const data = query.data;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{section.title}</CardTitle>
        <CardDescription>{section.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {query.isPending ? (
          <LoadingSkeleton
            variant="table"
            label={`Đang tải ${section.title.toLowerCase()}…`}
          />
        ) : query.isError ? (
          <Button variant="outline" onClick={() => void query.refetch()}>
            Tải lại danh sách
          </Button>
        ) : (
          <>
            <Table aria-label={section.title}>
              <TableHeader>
                <TableRow>
                  {section.columns.map((column) => (
                    <TableHead key={column}>{column}</TableHead>
                  ))}
                  {canManage && (
                    <TableHead className="text-right">Thao tác</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.rows.length ? (
                  data.rows.map((row) => (
                    <TableRow key={row._id}>
                      {kind === 'failures' ? (
                        <>
                          <TableCell>{dateTime(row.updatedAt)}</TableCell>
                          <TableCell>{row.error?.code}</TableCell>
                          <TableCell>{translated(row.error?.stage)}</TableCell>
                          <TableCell className="whitespace-normal">
                            {translated(row.error?.message)}
                          </TableCell>
                        </>
                      ) : kind === 'usage' ? (
                        <>
                          <TableCell>
                            {new Date(
                              Number(row._id.split(':').at(-1)) * 86400000
                            ).toLocaleDateString('vi-VN', { timeZone: 'UTC' })}
                          </TableCell>
                          <TableCell>
                            {row.count?.toLocaleString('vi-VN')}
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{dateTime(row.createdAt)}</TableCell>
                          <TableCell>{translated(row.event)}</TableCell>
                          <TableCell className="whitespace-normal">
                            {translated(row.reason)}
                          </TableCell>
                          <TableCell>{row.score}</TableCell>
                        </>
                      )}
                      {canManage && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive h-8 w-8"
                            aria-label={`Xóa bản ghi ${section.title.toLowerCase()}`}
                            disabled={remove.isPending}
                            onClick={() => setSelected(row)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={section.columns.length + (canManage ? 1 : 0)}
                      className="text-muted-foreground h-24 text-center"
                    >
                      {section.empty}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ListPagination
              label={`Phân trang ${section.title.toLowerCase()}`}
              page={data?.page ?? page}
              totalPages={Math.max(1, Math.ceil((data?.total ?? 0) / 10))}
              disabled={query.isFetching || remove.isPending}
              onPageChange={setPage}
            />
          </>
        )}
        <AlertDialog
          open={!!selected && canManage}
          onOpenChange={(open) => {
            if (!open && !remove.isPending) setSelected(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xóa bản ghi này?</AlertDialogTitle>
              <AlertDialogDescription>
                {kind === 'failures'
                  ? 'Bản ghi sẽ bị bỏ khỏi danh sách lỗi quản trị. Lịch sử trò chuyện của khách vẫn được giữ nguyên.'
                  : kind === 'usage'
                    ? 'Xóa số liệu lượt gọi của ngày đã chọn. Bộ đếm chống lạm dụng và trạng thái hạn mức nhà cung cấp vẫn được giữ nguyên.'
                    : 'Cảnh báo đã chọn sẽ bị xóa. Thao tác này không thể hoàn tác.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={remove.isPending}>
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90 text-white"
                disabled={remove.isPending}
                onClick={async (event) => {
                  event.preventDefault();
                  if (!selected || !canManage || remove.isPending) return;
                  const version =
                    kind === 'usage' ? selected.count : selected.updatedAt;
                  if (version === undefined) return;
                  try {
                    await remove.mutateAsync({ id: selected._id, version });
                    setSelected(null);
                  } catch {
                    /* Shared mutation handler displays the error toast. */
                  }
                }}
              >
                {remove.isPending ? 'Đang xóa…' : 'Xóa'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
