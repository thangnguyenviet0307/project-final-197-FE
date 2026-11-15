import { AiAdminRecordsSection } from '@/features/ai/components/ai-admin-records';
import { useAuthStore } from '@/stores/auth.store';
import { AiConfiguration } from '@/features/ai/components/ai-configuration';
import { toast } from 'sonner';
import {
  Activity,
  Database,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { BaseLayout } from '@/layout/admin/base-layout';
import { useAiAdmin } from '@/features/ai/hooks/use-ai-admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const number = new Intl.NumberFormat('vi-VN');
function dateTime(value?: string) {
  return value ? new Date(value).toLocaleString('vi-VN') : 'Chưa đồng bộ';
}
function EnabledBadge({ enabled }: { enabled: boolean }) {
  return (
    <Badge variant={enabled ? 'default' : 'secondary'}>
      {enabled ? 'Đã bật' : 'Chưa bật'}
    </Badge>
  );
}

export default function AiAdminPage() {
  const canManage = useAuthStore((state) => state.user?.role === 'super_admin');
  const { status, reindex } = useAiAdmin();
  const data = status.data;
  const today = Math.floor(status.dataUpdatedAt / 86400000);
  const todayCalls =
    data?.usage.find((usage) => Number(usage._id.split(':').at(-1)) === today)
      ?.count ?? 0;
  const syncStatus =
    data?.index?.state === 'completed'
      ? 'Hoàn tất'
      : data?.index?.state === 'failed'
        ? 'Lỗi, sẽ thử lại'
        : data?.index
          ? 'Đang chờ hoặc đang chạy'
          : 'Chưa lên lịch';
  return (
    <BaseLayout
      title="Quản trị AI"
      description="Theo dõi hoạt động trợ lý mua sắm, đồng bộ kiến thức và kiểm tra cảnh báo."
    >
      <div className="min-w-0 space-y-6 px-4 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Tổng quan hoạt động</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={status.isFetching}
              onClick={async () => {
                const result = await status.refetch();
                if (result.isSuccess)
                  toast.success('Đã cập nhật trạng thái AI.');
              }}
            >
              <RefreshCw
                className={status.isFetching ? 'animate-spin' : ''}
                aria-hidden="true"
              />
              {status.isFetching ? 'Đang cập nhật…' : 'Tải lại'}
            </Button>
            <Button
              disabled={
                reindex.isPending ||
                !canManage ||
                !data?.config.enabled ||
                !data.config.indexingEnabled
              }
              onClick={() => {
                if (canManage) reindex.mutate();
              }}
            >
              <Database aria-hidden="true" />
              {reindex.isPending ? 'Đang xếp lịch…' : 'Đồng bộ kiến thức'}
            </Button>
          </div>
        </div>
        {status.isPending && (
          <div
            role="status"
            aria-label="Đang tải dữ liệu AI"
            className="grid grid-cols-2 gap-4 lg:grid-cols-4"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <Card key={index}>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <AiConfiguration canManage={canManage} />
        {data && (
          <>
            <section
              aria-label="Thống kê AI"
              aria-busy={status.isFetching}
              className="grid grid-cols-2 gap-4 lg:grid-cols-4"
            >
              {[
                {
                  title: 'Hội thoại còn thời hạn',
                  value: data.conversations,
                  Icon: MessageSquare,
                },
                { title: 'Đoạn kiến thức', value: data.chunks, Icon: Database },
                {
                  title: 'Lượt gọi hôm nay (UTC)',
                  value: todayCalls,
                  Icon: Activity,
                },
                {
                  title: 'Cảnh báo được hiển thị',
                  value: data.risks.length,
                  Icon: ShieldAlert,
                },
              ].map(({ title, value, Icon }) => (
                <Card key={title}>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                    <CardTitle className="text-muted-foreground text-xs font-medium uppercase">
                      {title}
                    </CardTitle>
                    <Icon
                      className="text-muted-foreground size-4 shrink-0"
                      aria-hidden="true"
                    />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold tabular-nums">
                      {number.format(value)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </section>
            <div className="grid min-w-0 gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cấu hình trợ lý</CardTitle>
                  <CardDescription>
                    Thông tin cấu hình hiện tại trên máy chủ.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-muted-foreground">Trạng thái AI</dt>
                      <dd>
                        <EnabledBadge enabled={data.config.enabled} />
                      </dd>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2">
                      <dt className="text-muted-foreground">Model trả lời</dt>
                      <dd className="min-w-0 font-medium break-all">
                        {data.config.model}
                      </dd>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2">
                      <dt className="text-muted-foreground">
                        Model embeddings
                      </dt>
                      <dd className="min-w-0 font-medium break-all">
                        {data.config.embeddingModel}
                      </dd>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2">
                      <dt className="text-muted-foreground">Hạn mức dịch vụ</dt>
                      <dd className="font-medium tabular-nums">
                        Theo nhà cung cấp
                      </dd>
                    </div>
                  </dl>
                  <p className="text-muted-foreground mt-5 border-t pt-4 text-sm">
                    Cấu hình được quản lý trong phần Kết nối và Điều khiển vận
                    hành phía trên. Khóa API đầy đủ không hiển thị trên website.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Đồng bộ & theo dõi</CardTitle>
                  <CardDescription>
                    Trạng thái nguồn kiến thức và theo dõi rủi ro.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-muted-foreground">Đồng bộ tự động</dt>
                      <dd>
                        <EnabledBadge enabled={data.config.indexingEnabled} />
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-muted-foreground">Theo dõi rủi ro</dt>
                      <dd>
                        <EnabledBadge enabled={data.config.riskEnabled} />
                      </dd>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2">
                      <dt className="text-muted-foreground">
                        Đồng bộ gần nhất
                      </dt>
                      <dd className="font-medium">
                        {dateTime(data.index?.lastSuccessAt)}
                      </dd>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2">
                      <dt className="text-muted-foreground">
                        Trạng thái đồng bộ
                      </dt>
                      <dd>
                        <Badge
                          variant={
                            data.index?.state === 'failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {syncStatus}
                        </Badge>
                      </dd>
                    </div>
                  </dl>
                  {!data.config.indexingEnabled && (
                    <p className="text-muted-foreground mt-5 border-t pt-4 text-sm">
                      Đồng bộ kiến thức đang tắt. Trợ lý vẫn có thể tìm sản phẩm
                      theo từ khóa và danh mục.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
            <AiAdminRecordsSection kind="failures" canManage={canManage} />
            <AiAdminRecordsSection kind="usage" canManage={canManage} />
            <AiAdminRecordsSection kind="risks" canManage={canManage} />
          </>
        )}
      </div>
    </BaseLayout>
  );
}
