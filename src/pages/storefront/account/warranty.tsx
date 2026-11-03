import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WarrantyCreateForm } from '@/features/support/components/warranty-create-form';
import { WarrantyList } from '@/features/support/components/warranty-list';
import { WarrantyDetailPanel } from '@/features/support/components/warranty-detail';
import { warrantyIdSchema } from '@/features/support/schemas/support-schema';

export default function CustomerWarrantyPage() {
  const [params, setParams] = useSearchParams();
  const creating = params.get('new') === '1';
  const selected = params.get('request') ?? '';
  const [message, setMessage] = useState('');
  const orderId = params.get('order') ?? '';
  const item = params.get('item') ?? '';
  const hasTarget = params.has('order') || params.has('item');
  const validTarget =
    warrantyIdSchema.safeParse(orderId).success &&
    /^\d{1,4}$/.test(item) &&
    Number(item) <= 9999;
  function closeDetail() {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      next.delete('request');
      return next;
    });
  }
  function select(id: string) {
    setMessage('');
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (!id) {
        next.delete('request');
      } else {
        next.set('request', id);
      }
      next.delete('new');
      next.delete('order');
      next.delete('item');
      return next;
    });
  }
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Bảo hành của tôi</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Gửi yêu cầu cho sản phẩm trong đơn đã hoàn tất và theo dõi phản hồi
          của cửa hàng.
        </p>
        <Link
          to="/chinh-sach-bao-hanh"
          className="mt-3 inline-block text-sm font-semibold text-green-700 underline"
        >
          Xem chính sách & bảo hành
        </Link>
      </header>
      {!creating && (
        <Button
          onClick={() =>
            setParams((previous) => {
              const next = new URLSearchParams(previous);
              next.delete('request');
              next.set('new', '1');
              return next;
            })
          }
        >
          Tạo yêu cầu bảo hành
        </Button>
      )}
      {creating && hasTarget && !validTarget && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          Thông tin sản phẩm trên đường dẫn không hợp lệ.{' '}
          <Link to="/account/warranty?new=1" className="underline">
            Chọn sản phẩm từ đơn đã mua
          </Link>
        </div>
      )}
      {creating && (!hasTarget || validTarget) && (
        <WarrantyCreateForm
          key={`${orderId}:${item}`}
          initialOrderId={hasTarget ? orderId : undefined}
          initialItemIndex={hasTarget ? Number(item) : undefined}
          onCreated={(id) => {
            select(id);
            setMessage(
              'Đã gửi yêu cầu bảo hành. Bạn có thể bổ sung ảnh bên dưới và theo dõi phản hồi của cửa hàng tại đây.'
            );
          }}
          onCancel={() =>
            setParams((previous) => {
              const next = new URLSearchParams(previous);
              next.delete('new');
              next.delete('order');
              next.delete('item');
              return next;
            })
          }
        />
      )}
      {message && (
        <p
          role="status"
          className="rounded-xl bg-green-50 p-4 text-sm text-green-900"
        >
          {message}
        </p>
      )}
      <WarrantyList admin={false} selectedId={selected} onSelect={select} />
      {!creating &&
        selected &&
        (warrantyIdSchema.safeParse(selected).success ? (
          <WarrantyDetailPanel
            key={selected}
            id={selected}
            admin={false}
            onClose={closeDetail}
          />
        ) : (
          <p role="alert">
            Mã yêu cầu trên đường dẫn không hợp lệ. Hãy chọn yêu cầu từ danh
            sách.
          </p>
        ))}
    </div>
  );
}
