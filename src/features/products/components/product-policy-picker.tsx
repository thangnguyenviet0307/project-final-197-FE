import { usePolicy } from '@/features/support/hooks/use-support';
import { policyDocuments } from '@/features/support/utils/policy-documents';
import { Button } from '@/components/ui/button';

const keys = {
  warrantyInformation: 'warranty',
  shippingInformation: 'shipping',
  returnPolicy: 'returns',
} as const;
export function ProductPolicyPicker({
  name,
  value,
  onChange,
}: {
  name: keyof typeof keys;
  value: string;
  onChange: (value: string) => void;
}) {
  const query = usePolicy();
  const key = keys[name];
  const policy = policyDocuments.find((item) => item.key === key)!;
  const available = Boolean(
    query.data?.publishedAt && query.data.content[key]?.trim()
  );
  const selected = value
    .split('\n')
    .some((line) => line.trim() === policy.path);
  return (
    <div className="space-y-1">
      <label
        htmlFor={`${name}-policy`}
        className="text-muted-foreground text-xs"
      >
        Chọn {policy.title.toLocaleLowerCase('vi-VN')} của cửa hàng
      </label>
      <select
        id={`${name}-policy`}
        className="bg-background h-10 w-full rounded-md border px-3 text-sm"
        disabled={query.isPending || query.isError}
        aria-busy={query.isPending}
        value={selected ? policy.path : ''}
        onChange={(event) => {
          const notes = value
            .split('\n')
            .filter((line) => line.trim() !== policy.path)
            .join('\n')
            .trim();
          onChange([notes, event.target.value].filter(Boolean).join('\n'));
        }}
      >
        <option value="">Chỉ dùng nội dung tự nhập</option>
        {(available || selected) && (
          <option value={policy.path} disabled={!available}>
            {policy.title}
            {!available ? ' (chưa công bố)' : ''}
          </option>
        )}
      </select>
      <p className="text-muted-foreground text-xs">
        Chèn liên kết chính sách, giữ nguyên ghi chú bên dưới.
      </p>
      {!query.isPending && !query.isError && !available && (
        <p className="text-muted-foreground text-xs">
          Chưa có chính sách được công bố.
        </p>
      )}
      {query.isError && (
        <p role="alert" className="text-destructive text-xs">
          Không tải được chính sách.{' '}
          <Button
            type="button"
            variant="link"
            onClick={() => void query.refetch()}
          >
            Thử lại
          </Button>
        </p>
      )}
    </div>
  );
}
