import { LoadingSkeleton } from '@/components/loading-skeleton';
import { Button } from '@/components/ui/button';
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
  TableBody,
  TableHead,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { useAiRoutingMonitor } from '../hooks/use-ai-admin';
const labels: Record<string, string> = {
  running: 'Đang xử lý',
  completed: 'Hoàn tất',
  failed: 'Lỗi',
  cancelled: 'Đã dừng',
  interrupted: 'Gián đoạn',
  quota: 'Giới hạn quota / 429',
};
export function AiRoutingMonitor() {
  const query = useAiRoutingMonitor();
  const runs = query.data?.runs ?? [];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Theo dõi model chatbot</CardTitle>
        <CardDescription>
          Cập nhật mỗi 3 giây, tối đa 30 lượt gần nhất trong 24 giờ. Mỗi khách
          có thể dùng model khác nhau; thông tin chuyển model chỉ hiển thị tại
          trang quản trị.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {query.isPending && (
          <LoadingSkeleton
            label="Đang tải hoạt động model AI…"
            variant="table"
          />
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">
            Đang xử lý trong danh sách:{' '}
            {runs.filter((run) => run.status === 'running').length}
          </p>
          <Button
            variant="outline"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            Cập nhật hoạt động
          </Button>
        </div>
        <Table aria-label="Hoạt động model chatbot">
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian / lượt xử lý</TableHead>
              <TableHead>Model đang dùng / cuối cùng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Lịch sử chuyển model</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.map((run) => {
              const current = run.attempts.at(-1);
              return (
                <TableRow key={run._id}>
                  <TableCell>
                    <p>{new Date(run.updatedAt).toLocaleString('vi-VN')}</p>
                    <p className="text-muted-foreground text-xs">
                      {run.stage === 'answer'
                        ? 'Soạn câu trả lời'
                        : 'Phân tích nhu cầu'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p>{current?.model ?? 'Chờ model khả dụng'}</p>
                    <p className="text-muted-foreground text-xs">
                      {current?.provider}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        run.status === 'failed' ? 'destructive' : 'secondary'
                      }
                    >
                      {labels[run.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ol className="space-y-1">
                      {run.attempts.map((attempt, index) => (
                        <li key={index} className="text-xs">
                          {index + 1}. {attempt.provider} / {attempt.model} —{' '}
                          {labels[attempt.status]}
                          {attempt.finishedAt
                            ? ` (${new Date(attempt.finishedAt).toLocaleTimeString('vi-VN')})`
                            : ''}
                        </li>
                      ))}
                    </ol>
                  </TableCell>
                </TableRow>
              );
            })}
            {!query.isPending && !runs.length && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground h-20 text-center"
                >
                  Chưa có hoạt động model được ghi nhận.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
