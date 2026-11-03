import { useEffect, useRef, useState } from 'react';
import { validateImageFile } from '@/utils/image-file';
import { ImageFilePicker } from '@/components/image-file-picker';
import { RequiredMark } from '@/components/required-mark';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ListPagination } from '@/components/list-pagination';
import {
  useEligibleWarrantyOrders,
  useSupportMutations,
  useWarranties,
} from '@/features/support/hooks/use-support';
import { createWarrantySchema } from '@/features/support/schemas/support-schema';
import type { CreateWarrantyInput } from '@/features/support/types/support';
import { getApiError } from '@/services/api';
import { useUnsavedForm } from '@/hooks/use-unsaved-form';
import { isWarrantyRequestEligible } from '@/features/support/utils/warranty-eligibility';

export function WarrantyCreateForm({
  onCreated,
  onCancel,
  initialOrderId,
  initialItemIndex,
}: {
  onCreated: (id: string) => void;
  onCancel: () => void;
  initialOrderId?: string;
  initialItemIndex?: number;
}) {
  const [page, setPage] = useState(1);
  const query = useEligibleWarrantyOrders(page, initialOrderId);
  const existingRequests = useWarranties(false, 1, '', 200);
  const existingRequestOrderIds = new Set(
    (existingRequests.data?.data ?? [])
      .map((item) => item.orderId ?? '')
      .filter(Boolean)
  );
  const eligibleOrders = (query.data?.data ?? []).filter((order) =>
    isWarrantyRequestEligible(
      order._id,
      order.orderDate,
      existingRequestOrderIds
    )
  );
  const [manualSelection, setSelection] = useState<{
    orderId: string;
    itemIndex: number;
    label: string;
  } | null>(null);
  const initialOrder = eligibleOrders.find(
    (order) => order._id === initialOrderId
  );
  const initialItem = initialOrder?.items.find(
    (item) => item.itemIndex === initialItemIndex
  );
  const selection =
    manualSelection ??
    (initialOrder && initialItem
      ? {
          orderId: initialOrder._id,
          itemIndex: initialItem.itemIndex,
          label: `${initialOrder.orderCode} · ${initialItem.productName}${initialItem.variantName ? ` · ${initialItem.variantName}` : ''}`,
        }
      : null);
  const [description, setDescription] = useState('');
  const [pendingInput, setPendingInput] = useState<CreateWarrantyInput | null>(
    null
  );
  const [canEdit, setCanEdit] = useState(false);
  const [error, setError] = useState('');
  const mutations = useSupportMutations();
  const mutation = mutations.create;
  const [images, setImages] = useState<{ file: File; url: string }[]>([]);
  const [uploaded, setUploaded] = useState<number[]>([]);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const busy =
    submitting || mutation.isPending || (mutations.upload?.isPending ?? false);
  const previews = useRef(new Set<string>());
  useEffect(() => {
    const urls = previews.current;
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, []);
  const navigation = useUnsavedForm(
    description.length > 0 || pendingInput !== null || images.length > 0 || busy
  );
  async function submit() {
    if (busy) return;
    const parsed = createWarrantySchema.safeParse(
      pendingInput ?? {
        requestId: crypto.randomUUID(),
        orderId: selection?.orderId,
        itemIndex: selection?.itemIndex,
        description,
      }
    );
    if (!parsed.success) {
      setError(
        selection
          ? parsed.error.issues[0].message
          : 'Vui lòng chọn sản phẩm trong đơn đã hoàn tất.'
      );
      return;
    }
    setPendingInput(parsed.data);
    setError('');
    setCanEdit(false);
    setSubmitting(true);
    let requestId = createdId;
    try {
      if (!requestId) {
        const result = await mutation.mutateAsync(parsed.data);
        requestId = result._id;
        setCreatedId(requestId);
      }
      for (let index = 0; index < images.length; index++) {
        if (uploaded.includes(index)) continue;
        await mutations.upload.mutateAsync({
          id: requestId,
          file: images[index].file,
        });
        setUploaded((current) =>
          current.includes(index) ? current : [...current, index]
        );
      }
      setPendingInput(null);
      setDescription('');
      setSelection(null);
      navigation.allowSavedNavigation();
      onCreated(requestId);
    } catch (failure) {
      const apiError = getApiError(failure);
      setError(
        requestId
          ? `Yêu cầu đã được tạo nhưng ảnh chưa tải lên đầy đủ. ${apiError.message}`
          : apiError.message
      );
      setCanEdit(
        !requestId && [400, 404, 409, 413].includes(apiError.statusCode)
      );
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <section className="rounded-2xl border p-5 sm:p-6">
      <h3 className="text-xl font-bold">Gửi yêu cầu bảo hành</h3>
      {initialOrderId && (
        <Link
          to="/account/warranty?new=1"
          className="mt-2 inline-block text-sm text-green-700 underline"
        >
          Chọn đơn hàng khác
        </Link>
      )}
      <p className="text-muted-foreground mt-2 text-sm leading-6">
        Chọn sản phẩm đã mua. Sau khi gửi, bạn có thể bổ sung ảnh trước khi nhân
        viên tiếp nhận. Cửa hàng sẽ kiểm tra điều kiện bảo hành trước khi xác
        nhận phương án.
      </p>
      {query.isPending ? (
        <p role="status" className="mt-4">
          Đang tải đơn đã hoàn tất…
        </p>
      ) : query.isError ? (
        <div role="alert" className="mt-4">
          <p>{getApiError(query.error).message}</p>
          <Button variant="outline" onClick={() => void query.refetch()}>
            Thử lại
          </Button>
        </div>
      ) : (
        <>
          {!eligibleOrders.length && (
            <p className="mt-4 text-sm">
              {page > 1
                ? 'Không có đơn ở trang này.'
                : initialOrderId
                  ? 'Đơn được chọn không còn khả dụng, đã hết thời hạn bảo hành hoặc đã có yêu cầu bảo hành trước đó.'
                  : 'Chưa có đơn đủ điều kiện để tạo bảo hành. Đơn phải đã hoàn tất và còn trong thời hạn 7 ngày.'}{' '}
              <Link to="/contact" className="underline">
                Liên hệ
              </Link>
            </p>
          )}
          <fieldset
            disabled={pendingInput !== null || busy}
            className="mt-4 space-y-3"
          >
            <legend className="mb-3 font-semibold">
              Sản phẩm trong đơn đã hoàn tất
              <RequiredMark />
            </legend>
            {eligibleOrders.map((order) => (
              <div
                key={order._id}
                className="bg-muted/20 rounded-xl border p-3"
              >
                <p className="mb-2 text-sm font-semibold">{order.orderCode}</p>
                {order.items.map((item) => (
                  <label
                    key={item.itemIndex}
                    className="flex cursor-pointer gap-3 py-2 text-sm"
                  >
                    <input
                      type="radio"
                      aria-required="true"
                      name="warranty-product"
                      checked={
                        selection?.orderId === order._id &&
                        selection.itemIndex === item.itemIndex
                      }
                      onChange={() =>
                        setSelection({
                          orderId: order._id,
                          itemIndex: item.itemIndex,
                          label: `${order.orderCode} · ${item.productName}${item.variantName ? ` · ${item.variantName}` : ''}`,
                        })
                      }
                    />
                    <span>
                      {item.productName}
                      {item.variantName && ` · ${item.variantName}`}{' '}
                      <span className="text-muted-foreground">
                        (đã mua {item.quantity})
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            ))}
          </fieldset>
          {query.data.pagination.totalPages > 1 && (
            <ListPagination
              label="Chọn đơn để bảo hành"
              page={page}
              totalPages={query.data.pagination.totalPages}
              disabled={query.isFetching || pendingInput !== null}
              onPageChange={setPage}
            />
          )}
        </>
      )}
      {selection && (
        <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-900">
          Đã chọn: {selection.label}
        </p>
      )}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        className="mt-5 space-y-3"
      >
        <p className="text-muted-foreground text-sm">
          Yêu cầu sẽ được cửa hàng kiểm tra theo chính sách thực tế; gửi yêu cầu
          không đồng nghĩa được chấp nhận bảo hành. Sau khi gửi, bạn có thể bổ
          sung tối đa 5 ảnh khi yêu cầu còn chờ tiếp nhận.
        </p>
        <label htmlFor="warranty-description" className="font-semibold">
          Mô tả tình trạng lỗi
          <RequiredMark />
        </label>
        <textarea
          id="warranty-description"
          rows={5}
          minLength={10}
          maxLength={3000}
          required
          disabled={pendingInput !== null || busy}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Sản phẩm gặp lỗi gì, xuất hiện khi nào và bạn đã kiểm tra như thế nào?"
          className="bg-background w-full rounded-lg border p-3 text-sm leading-6"
        />
        <p className="text-muted-foreground text-xs">
          Không nhập mật khẩu, mã xác thực hoặc thông tin thanh toán.
        </p>
        <div className="space-y-3 rounded-xl border p-4">
          <label
            htmlFor="warranty-initial-images"
            className="block text-sm font-semibold"
          >
            Ảnh tình trạng sản phẩm ({images.length}/5, không bắt buộc)
          </label>
          <p className="text-muted-foreground text-xs">
            Chọn tối đa 5 ảnh JPG, PNG hoặc WebP, mỗi ảnh tối đa 5 MB. Bạn vẫn
            có thể bổ sung ảnh sau khi gửi yêu cầu.
          </p>
          <ImageFilePicker
            id="warranty-initial-images"
            multiple
            disabled={busy || !!pendingInput || images.length >= 5}
            selectionText={
              images.length ? `Đã chọn ${images.length} ảnh` : 'Chưa chọn ảnh'
            }
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = '';
              if (files.length + images.length > 5) {
                setError('Chỉ chọn tối đa 5 ảnh.');
                return;
              }
              const invalid = files.map(validateImageFile).find(Boolean);
              if (invalid) {
                setError(invalid);
                return;
              }
              setImages((current) => [
                ...current,
                ...files.map((file) => {
                  const url = URL.createObjectURL(file);
                  previews.current.add(url);
                  return { file, url };
                }),
              ]);
              setError('');
            }}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((image, index) => (
              <div key={image.url} className="min-w-0 rounded-lg border p-2">
                <img
                  src={image.url}
                  alt={`Ảnh bảo hành đã chọn ${index + 1}`}
                  className="aspect-square w-full rounded-md object-cover"
                />
                <p className="mt-2 truncate text-xs">{image.file.name}</p>
                {uploaded.includes(index) ? (
                  <p className="mt-1 text-xs text-green-700">Đã tải lên</p>
                ) : (
                  <p className="text-muted-foreground mt-1 text-xs">
                    Chưa tải lên
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  disabled={busy || !!pendingInput}
                  onClick={() => {
                    URL.revokeObjectURL(image.url);
                    previews.current.delete(image.url);
                    setImages((current) =>
                      current.filter((entry) => entry.url !== image.url)
                    );
                  }}
                >
                  Bỏ ảnh {index + 1}
                </Button>
              </div>
            ))}
          </div>
        </div>
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
        {pendingInput && !busy && !canEdit && !createdId && (
          <p role="status" className="text-sm">
            Chưa xác nhận được kết quả gửi. Bấm thử lại với cùng nội dung để
            tránh tạo trùng yêu cầu. Giữ trang này mở đến khi có kết quả.
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            disabled={busy || (!selection && !pendingInput)}
          >
            {busy
              ? 'Đang gửi…'
              : createdId
                ? 'Thử tải các ảnh còn lại'
                : pendingInput
                  ? 'Thử gửi lại yêu cầu'
                  : 'Gửi yêu cầu'}
          </Button>
          {createdId && (
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() =>
                navigation.confirmDiscard(() => {
                  navigation.allowSavedNavigation();
                  onCreated(createdId);
                })
              }
            >
              Xem yêu cầu đã tạo
            </Button>
          )}
          {pendingInput && canEdit && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPendingInput(null);
                setError('');
              }}
            >
              Chỉnh sửa thông tin
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => navigation.confirmDiscard(onCancel)}
          >
            Đóng biểu mẫu
          </Button>
        </div>
      </form>
      {navigation.guard}
    </section>
  );
}
