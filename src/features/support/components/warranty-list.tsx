import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ListPagination } from '@/components/list-pagination';
import { useWarranties } from '@/features/support/hooks/use-support';
import { warrantyStatuses } from '@/features/support/schemas/support-schema';
import type { WarrantyStatus } from '@/features/support/types/support';
import { supportDate, warrantyLabels } from '@/features/support/utils/support';

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
  return (
    <section className="rounded-2xl border bg-background p-5 sm:p-6">
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
          className="rounded-lg border bg-background p-2 text-sm"
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
                onClick={() => onSelect(item._id)}
                className={`block w-full rounded-xl border p-4 text-left transition hover:border-green-500 ${selectedId === item._id ? 'border-green-600 bg-green-50/50' : 'bg-background'}`}
              >
                <span className="block text-sm font-semibold">
                  {item.productName}
                  {item.variantName && ` · ${item.variantName}`}
                </span>
                <span className="mt-2 block text-xs text-muted-foreground">
                  {item.orderCode} · {supportDate(item.createdAt)}
                  {admin && ` · ${item.customerName ?? ''}`}
                </span>
                <span className="mt-2 block text-sm font-medium text-green-700">
                  {warrantyLabels[item.status]}
                </span>
              </button>
            ))}
          </div>
          {!query.data.data.length && (
            <p className="mt-5 text-sm text-muted-foreground">
              {page > 1
                ? 'Không có yêu cầu ở trang này. Hãy chọn trang trước.'
                : 'Chưa có yêu cầu phù hợp.'}
            </p>
          )}
          {query.data.pagination.totalPages > 1 || page > 1 ? (
            <ListPagination
              label="Phân trang yêu cầu bảo hành"
              page={page}
              totalPages={Math.max(1, query.data.pagination.totalPages)}
              disabled={query.isFetching}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </section>
  );
}
