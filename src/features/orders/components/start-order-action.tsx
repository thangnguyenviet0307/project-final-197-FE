import { isAdministrator } from '@/features/auth/utils/roles';
import { RequiredMark } from '@/components/required-mark';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/auth.store';
import { useOrderAssignees } from '@/features/orders/hooks/use-order-assignees';
import { Input } from '@/components/ui/input';
import { ListPagination } from '@/components/list-pagination';
import { useStartOrder } from '@/features/orders/hooks/use-orders';
import { getApiError } from '@/services/api';
import type { Order } from '@/features/orders/types/orders';

export function HandlerPicker({
  onSelect,
  selected,
  disabled,
}: {
  onSelect: (id: string) => void;
  selected: string;
  disabled: boolean;
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const user = useAuthStore((state) => state.user);
  const query = useOrderAssignees(page, search);
  const candidates =
    query.data?.data.filter(
      (person) =>
        person._id !== user?.id &&
        (person.role === 'staff' ||
          (user?.role === 'super_admin' && person.role === 'admin'))
    ) ?? [];
  return (
    <div className="min-w-0 space-y-3">
      <p className="text-sm font-medium">
        Nhân viên tiếp nhận
        <RequiredMark />
      </p>
      <label className="bg-muted/30 flex min-w-0 items-start gap-3 rounded-lg border p-3 text-sm">
        <input
          type="radio"
          name="order-handler"
          className="mt-1 shrink-0"
          checked={selected === user?.id}
          disabled={disabled}
          onChange={() => {
            if (user) onSelect(user.id);
          }}
        />
        <span className="min-w-0 font-medium break-words">
          Tự nhận đơn{user ? ` · ${user.lastName} ${user.firstName}` : ''}
        </span>
      </label>
      <label className="grid min-w-0 gap-1 text-sm">
        Tìm nhân viên xử lý
        <Input
          placeholder="Tìm theo tên hoặc email nhân viên"
          className="w-full min-w-0"
          value={search}
          disabled={disabled}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      </label>
      {query.isPending ? (
        <p role="status">Đang tải nhân viên…</p>
      ) : query.isError ? (
        <div role="alert">
          <p>{getApiError(query.error).message}</p>
          <Button variant="outline" onClick={() => void query.refetch()}>
            Tải lại nhân viên
          </Button>
        </div>
      ) : (
        <>
          <div
            className="max-h-48 space-y-2 overflow-y-auto"
            aria-busy={query.isFetching}
          >
            {candidates.map((person) => (
              <label
                key={person._id}
                className="flex min-w-0 items-start gap-3 rounded-lg border p-3 text-sm"
              >
                <input
                  type="radio"
                  name="order-handler"
                  value={person._id}
                  checked={selected === person._id}
                  disabled={disabled || query.isFetching}
                  onChange={() => onSelect(person._id)}
                />
                <span className="min-w-0 break-words">
                  <span className="block font-medium">
                    {[person.lastName, person.firstName]
                      .filter(Boolean)
                      .join(' ') || person.email}
                  </span>
                  <span className="text-muted-foreground block text-xs break-all">
                    {person.email} ·{' '}
                    {person.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                  </span>
                </span>
              </label>
            ))}
          </div>
          {!candidates.length && (
            <p>Không có nhân viên đang hoạt động trên trang này.</p>
          )}
          <ListPagination
            label="Phân trang người xử lý đơn"
            page={page}
            totalPages={Math.max(1, query.data?.pagination.totalPages ?? 1)}
            disabled={disabled || query.isFetching}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

export function StartOrderAction({
  order,
  disabled,
}: {
  order: Order;
  disabled?: boolean;
}) {
  const user = useAuthStore((state) => state.user);
  const [open, setOpen] = useState(false);
  const [handler, setHandler] = useState('');
  const mutation = useStartOrder();
  const assignee =
    typeof order.userId === 'string' ? order.userId : order.userId?._id;
  const admin = isAdministrator(user?.role);
  const eligible =
    order.orderStatus === 1 &&
    (admin || (user?.role === 'staff' && (!assignee || assignee === user.id)));
  if (!eligible || !user) return null;
  if (!admin)
    return (
      <div className="min-w-0 space-y-3">
        <Button
          size="sm"
          disabled={disabled || mutation.isPending}
          onClick={() => mutation.mutate({ id: order._id })}
        >
          {mutation.isPending ? 'Starting…' : 'Nhận đơn & bắt đầu'}
        </Button>
        {mutation.error && (
          <p role="alert" className="text-destructive text-sm">
            {getApiError(mutation.error).message}
          </p>
        )}
      </div>
    );
  return (
    <>
      <Button
        size="sm"
        disabled={disabled || mutation.isPending}
        onClick={() => {
          setHandler(user.id);
          mutation.reset();
          setOpen(true);
        }}
      >
        Phân công và bắt đầu
      </Button>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!mutation.isPending) setOpen(value);
        }}
      >
        <DialogContent
          className="sm:max-w-lg"
          showCloseButton={!mutation.isPending}
        >
          <DialogHeader>
            <DialogTitle>Bắt đầu xử lý đơn hàng?</DialogTitle>
            <DialogDescription className="break-all">
              Đơn hàng {order.orderCode ?? order._id} sẽ được phân công và
              chuyển từ Chờ xử lý sang Đang xử lý.
            </DialogDescription>
          </DialogHeader>
          {open && (
            <HandlerPicker
              selected={handler}
              onSelect={setHandler}
              disabled={mutation.isPending}
            />
          )}
          {mutation.error && (
            <p role="alert" className="text-destructive">
              {getApiError(mutation.error).message}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button
              disabled={disabled || mutation.isPending || !handler}
              onClick={() =>
                mutation.mutate(
                  { id: order._id, ...(admin ? { userId: handler } : {}) },
                  { onSuccess: () => setOpen(false) }
                )
              }
            >
              {mutation.isPending ? 'Starting…' : 'Xác nhận bắt đầu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
