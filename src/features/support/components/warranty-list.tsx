import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ListPagination } from '@/components/list-pagination';
import { useWarranties } from '@/features/support/hooks/use-support';
import { warrantyStatuses } from '@/features/support/schemas/support-schema';
import type { WarrantyStatus } from '@/features/support/types/support';
import {
  supportDate,
  warrantyLabels,
  warrantyStatusStyles,
  adminWarrantyStatusStyles,
} from '@/features/support/utils/support';
import { useAuthStore } from '@/stores/auth.store';

export function WarrantyList({
  admin,
  selectedId,
  onSelect,
}: {
  admin: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<WarrantyStatus | ''>('');
  const query = useWarranties(admin, page, status);
  const userId = useAuthStore((state) => state.user?.id);
  return (
    <section className="bg-background rounded-2xl border p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-bold">
          {admin ? 'Danh sách yêu cầu' : 'Yêu cầu của tôi'}
        </h3>
        <select
          aria-label="Lọc trạng thái bảo hành"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as WarrantyStatus | '');
            setPage(1);
          }}
          className="bg-background rounded-lg border p-2 text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          {warrantyStatuses.map((value) => (
            <option key={value} value={value}>
              {warrantyLabels[value]}
            </option>
          ))}
        </select>
      </div>
      {query.isPending ? (
        <p role="status" className="mt-5">
          Đang tải yêu cầu…
        </p>
      ) : query.isError ? (
        <div role="alert" className="mt-5">
          <p>Không thể tải danh sách yêu cầu.</p>
          <Button variant="outline" onClick={() => void query.refetch()}>
            Thử lại
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-4 space-y-3">
            {query.data.data.map((item) => (
              <button
                key={item._id}
                type="button"
                aria-pressed={selectedId === item._id}
                onClick={() =>
                  onSelect(selectedId === item._id ? '' : item._id)
                }
                className={`block w-full rounded-xl border p-4 text-left transition ${admin ? 'hover:border-ring' : 'hover:border-green-500'} ${selectedId === item._id ? (admin ? 'border-ring bg-accent text-accent-foreground' : 'border-green-600 bg-green-50/50') : 'bg-background'}`}
              >
                <span className="block text-sm font-semibold">
                  {item.productName}
                  {item.variantName && ` · ${item.variantName}`}
                </span>
                <span className="text-muted-foreground mt-2 block text-xs">
                  {item.orderCode} · {supportDate(item.createdAt)}
                  {admin && ` · ${item.customerName ?? ''}`}
                </span>
                <span className="text-muted-foreground mt-2 block text-xs">
                  Người tiếp nhận:{' '}
                  {item.handlerName ||
                    (item.handlerId
                      ? 'Nhân viên cửa hàng'
                      : 'Chưa có người tiếp nhận')}
                  {admin && item.handlerId === userId && ' (Bạn)'}
                </span>
                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${(admin ? adminWarrantyStatusStyles : warrantyStatusStyles)[item.status]}`}
                >
                  {warrantyLabels[item.status]}
                </span>
              </button>
            ))}
          </div>
          {!query.data.data.length && (
            <p className="text-muted-foreground mt-5 text-sm">
              {page > 1
                ? 'Không có yêu cầu ở trang này. Hãy chọn trang trước.'
                : 'Chưa có yêu cầu phù hợp.'}
            </p>
          )}
          <ListPagination
            label="Phân trang yêu cầu bảo hành"
            page={page}
            totalPages={Math.max(1, query.data.pagination.totalPages)}
            disabled={query.isFetching}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}
