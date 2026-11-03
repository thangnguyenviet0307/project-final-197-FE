import { useEffect, useState } from 'react';
import { RequiredMark } from '@/components/required-mark';
import { ImageFilePicker } from '@/components/image-file-picker';
import { Button } from '@/components/ui/button';
import {
  useSupportMutations,
  useWarranty,
} from '@/features/support/hooks/use-support';
import {
  updateWarrantySchema,
  validateWarrantyImage,
} from '@/features/support/schemas/support-schema';
import type {
  WarrantyDetail,
  WarrantyStatus,
} from '@/features/support/types/support';
import {
  warrantyLabels,
  warrantyTransitions,
  supportDate,
  warrantyStatusStyles,
} from '@/features/support/utils/support';
import { getApiError } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { useUnsavedForm } from '@/hooks/use-unsaved-form';

function WarrantyUpdateForm({
  initial,
  reload,
  saved,
}: {
  initial: WarrantyDetail;
  reload: () => Promise<void>;
  saved: (doc: WarrantyDetail) => void;
}) {
  const user = useAuthStore((state) => state.user);
  const [baseline, setBaseline] = useState(initial);
  const choices = warrantyTransitions[baseline.status];
  const [status, setStatus] = useState<WarrantyStatus>(
    choices[0] ?? baseline.status
  );
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const mutation = useSupportMutations().update;
  const navigation = useUnsavedForm(
    note.length > 0 ||
      status !== (choices[0] ?? baseline.status) ||
      mutation.isPending
  );
  const mayHandle =
    user?.role !== 'staff' ||
    baseline.status === 'submitted' ||
    baseline.handlerId === user?.id;
  async function submit() {
    const parsed = updateWarrantySchema.safeParse({
      status,
      note,
      expectedVersion: baseline.__v,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    try {
      const result = await mutation.mutateAsync({
        ...parsed.data,
        id: baseline._id,
      });
      setBaseline(result);
      setNote('');
      setError('');
      setStatus(warrantyTransitions[result.status][0] ?? result.status);
      saved(result);
    } catch (failure) {
      const apiError = getApiError(failure);
      setError(apiError.message);
      if (apiError.statusCode === 409) setConflict(true);
    }
  }
  return (
    <section className="mt-6 rounded-xl border p-4">
      <h4 className="font-semibold">Xử lý yêu cầu</h4>
      {!choices.length ? (
        <p className="text-muted-foreground mt-3 text-sm">
          Yêu cầu đã kết thúc.
        </p>
      ) : !mayHandle ? (
        <p className="text-muted-foreground mt-3 text-sm">
          Yêu cầu do nhân viên khác phụ trách. Bạn có thể xem lịch sử xử lý.
        </p>
      ) : (
        <form
          noValidate
          className="mt-3 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <label htmlFor="warranty-status" className="block text-sm">
            Trạng thái tiếp theo
            <RequiredMark />
          </label>
          <select
            id="warranty-status"
            aria-required="true"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as WarrantyStatus)
            }
            disabled={mutation.isPending || conflict}
            className="bg-background w-full rounded-lg border p-3 text-sm"
          >
            {choices.map((choice) => (
              <option key={choice} value={choice}>
                {warrantyLabels[choice]}
              </option>
            ))}
          </select>
          <label htmlFor="warranty-note" className="block text-sm">
            Phản hồi cho khách hàng
            <RequiredMark />
          </label>
          <textarea
            id="warranty-note"
            required
            maxLength={1000}
            rows={4}
            value={note}
            disabled={mutation.isPending}
            onChange={(event) => setNote(event.target.value)}
            className="bg-background w-full rounded-lg border p-3 text-sm"
          />
          <p className="text-muted-foreground text-xs">
            Phản hồi được hiển thị cho khách. Khi tiếp nhận, bạn trở thành người
            phụ trách yêu cầu.
          </p>
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
          {conflict && (
            <p role="alert" className="text-sm">
              Bản nháp được giữ lại. Hãy tải bản mới để kiểm tra trạng thái
              trước khi lưu tiếp.
            </p>
          )}
          <Button disabled={mutation.isPending || conflict} type="submit">
            {mutation.isPending
              ? 'Đang lưu…'
              : baseline.status === 'submitted'
                ? 'Tiếp nhận yêu cầu'
                : 'Cập nhật trạng thái'}
          </Button>
        </form>
      )}
      <Button
        className="mt-3"
        variant="outline"
        disabled={mutation.isPending}
        onClick={() => navigation.confirmDiscard(() => void reload())}
      >
        Tải bản mới
      </Button>
      {navigation.guard}
    </section>
  );
}
function WarrantyImageForm({ detail }: { detail: WarrantyDetail }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [inputKey, setInputKey] = useState(0);
  const [error, setError] = useState('');
  const mutation = useSupportMutations().upload;
  const navigation = useUnsavedForm(file !== null || mutation.isPending);
  const canAddImage = detail.status === 'submitted';
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );
  function clearFile() {
    setFile(null);
    setPreview(null);
    setInputKey((value) => value + 1);
  }
  async function upload() {
    if (!file) return;
    const invalid = validateWarrantyImage(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    try {
      await mutation.mutateAsync({ id: detail._id, file });
      clearFile();
      setError('');
      setMessage('Đã bổ sung ảnh vào yêu cầu bảo hành.');
    } catch (failure) {
      setError(getApiError(failure).message);
    }
  }
  return (
    <div className="mt-5 space-y-3">
      <label htmlFor="warranty-image" className="block text-sm font-semibold">
        Bổ sung ảnh ({detail.images.length}/5)
      </label>
      <p className="text-muted-foreground text-xs">
        JPG, PNG, WebP; tối đa 5 MB/ảnh. Không tải ảnh chứa mật khẩu hoặc thông
        tin nhạy cảm.
      </p>
      <ImageFilePicker
        key={inputKey}
        id="warranty-image"
        selectionText={file ? 'Đã chọn 1 ảnh' : 'Chưa chọn ảnh'}
        disabled={
          mutation.isPending || detail.images.length >= 5 || !canAddImage
        }
        onChange={(event) => {
          const selected = event.target.files?.[0] ?? null;
          const invalid = selected ? validateWarrantyImage(selected) : null;
          setMessage('');
          if (invalid) {
            clearFile();
            setError(invalid);
            return;
          }
          setFile(selected);
          setPreview(selected ? URL.createObjectURL(selected) : null);
          setError('');
        }}
      />
      {file && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border p-3">
          {preview && (
            <img
              src={preview}
              alt="Ảnh đang chọn để gửi bảo hành"
              className="size-24 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm break-all">{file.name}</p>
            <p className="text-muted-foreground text-xs">
              {(file.size / 1024 / 1024).toFixed(2)} MB · Chưa xác nhận tải lên
            </p>
          </div>
          <Button
            variant="outline"
            disabled={mutation.isPending}
            onClick={() => {
              clearFile();
              setError('');
            }}
          >
            Bỏ ảnh đã chọn
          </Button>
        </div>
      )}
      {message && (
        <p role="status" className="text-sm text-green-700">
          {message}
        </p>
      )}
      {!canAddImage && (
        <p className="text-muted-foreground text-sm">
          Chỉ có thể bổ sung ảnh khi yêu cầu đang chờ tiếp nhận.
        </p>
      )}
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      <Button
        variant="outline"
        disabled={
          !file ||
          mutation.isPending ||
          detail.images.length >= 5 ||
          !canAddImage
        }
        onClick={() => void upload()}
      >
        {mutation.isPending ? 'Đang tải ảnh…' : 'Tải ảnh lên'}
      </Button>
      {navigation.guard}
    </div>
  );
}
export function WarrantyDetailPanel({
  id,
  admin,
  onClose,
}: {
  id: string;
  admin: boolean;
  onClose?: () => void;
}) {
  const query = useWarranty(admin, id);
  const [session, setSession] = useState(0);
  const [message, setMessage] = useState('');
  async function reload() {
    const result = await query.refetch();
    if (result.isSuccess) {
      setSession((value) => value + 1);
      setMessage('');
    } else setMessage(getApiError(result.error).message);
  }
  if (query.isPending) return <p role="status">Đang tải yêu cầu…</p>;
  if (!query.data)
    return (
      <div role="alert">
        <p>{getApiError(query.error).message}</p>
        <Button onClick={() => void query.refetch()}>Thử lại</Button>
      </div>
    );
  const detail = query.data;
  return (
    <section
      className="bg-background rounded-2xl border p-5 sm:p-6"
      aria-label="Chi tiết yêu cầu bảo hành"
    >
      <div className="flex flex-wrap justify-between gap-3">
        <h3 className="text-xl font-bold">Chi tiết bảo hành</h3>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${warrantyStatusStyles[detail.status]}`}
        >
          {warrantyLabels[detail.status]}
        </span>
      </div>
      <p className="mt-3 font-semibold">
        {detail.productName}
        {detail.variantName && ` · ${detail.variantName}`}
      </p>
      <p className="text-muted-foreground mt-1 text-sm">
        Đơn {detail.orderCode} · {supportDate(detail.createdAt)}
      </p>
      <p className="text-muted-foreground mt-1 text-xs break-all">
        Mã yêu cầu: {detail._id}
      </p>
      {admin && (
        <div className="bg-muted/30 mt-4 rounded-lg p-3 text-sm">
          <p>{detail.customerName}</p>
          <p className="break-all">{detail.customerEmail}</p>
          <p>{detail.customerPhone || 'Chưa có số điện thoại'}</p>
        </div>
      )}
      <h4 className="mt-5 font-semibold">Mô tả của khách hàng</h4>
      <p className="mt-2 text-sm leading-7 break-words whitespace-pre-wrap">
        {detail.description}
      </p>
      {!!detail.images.length && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {detail.images.map((image, index) => (
            <a
              key={image._id}
              href={image.url}
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={image.url}
                alt={`Ảnh tình trạng sản phẩm ${index + 1}`}
                className="aspect-square w-full rounded-xl border object-cover"
              />
              <span className="text-xs underline">Mở ảnh {index + 1}</span>
            </a>
          ))}
        </div>
      )}
      {!!detail.images.length && (
        <p className="text-muted-foreground mt-2 text-xs">
          Liên kết ảnh có hiệu lực trong 1 giờ. Tải lại nếu ảnh không còn hiển
          thị.
        </p>
      )}
      {!admin && <WarrantyImageForm detail={detail} />}
      <h4 className="mt-6 font-semibold">Lịch sử xử lý</h4>
      <ol className="mt-4 space-y-4 border-l-2 border-green-200 pl-4">
        {detail.history.map((entry, index) => (
          <li key={index}>
            <p className="text-sm font-semibold">
              {warrantyLabels[entry.status]}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {supportDate(entry.createdAt)} · {entry.actorName}
            </p>
            <p className="mt-2 text-sm leading-6 break-words whitespace-pre-wrap">
              {entry.note}
            </p>
          </li>
        ))}
      </ol>
      {message && (
        <p role="status" className="mt-4 text-sm">
          {message}
        </p>
      )}
      {admin ? (
        <WarrantyUpdateForm
          key={session}
          initial={detail}
          reload={reload}
          saved={() => setMessage('Đã cập nhật yêu cầu bảo hành.')}
        />
      ) : (
        <Button
          className="mt-5"
          variant="outline"
          onClick={() => void reload()}
        >
          Tải lại yêu cầu
        </Button>
      )}
      {onClose && (
        <div className="mt-5">
          <Button type="button" variant="outline" onClick={onClose}>
            Đóng chi tiết
          </Button>
        </div>
      )}
    </section>
  );
}
