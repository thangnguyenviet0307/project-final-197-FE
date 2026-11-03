import { useSearchParams } from 'react-router-dom';
import { BaseLayout } from '@/layout/admin/base-layout';
import { WarrantyList } from '@/features/support/components/warranty-list';
import { WarrantyDetailPanel } from '@/features/support/components/warranty-detail';
import { warrantyIdSchema } from '@/features/support/schemas/support-schema';

export default function AdminWarrantiesPage() {
  const [params, setParams] = useSearchParams();
  const selected = params.get('request') ?? '';
  function closeDetail() {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      next.delete('request');
      return next;
    });
  }
  return (
    <BaseLayout
      title="Yêu cầu bảo hành"
      description="Tiếp nhận, kiểm tra và cập nhật kết quả hỗ trợ khách hàng."
    >
      <div className="space-y-6 px-4 lg:px-6">
        <WarrantyList
          admin
          selectedId={selected}
          onSelect={(id) =>
            setParams((previous) => {
              const next = new URLSearchParams(previous);
              if (!id || id === selected) {
                next.delete('request');
              } else {
                next.set('request', id);
              }
              return next;
            })
          }
        />
        {selected ? (
          warrantyIdSchema.safeParse(selected).success ? (
            <WarrantyDetailPanel
              key={selected}
              id={selected}
              admin
              onClose={closeDetail}
            />
          ) : (
            <p role="alert">Mã yêu cầu không hợp lệ.</p>
          )
        ) : (
          <div className="text-muted-foreground rounded-2xl border border-dashed p-10 text-center">
            Chọn một yêu cầu để xem chi tiết và xử lý.
          </div>
        )}
      </div>
    </BaseLayout>
  );
}
