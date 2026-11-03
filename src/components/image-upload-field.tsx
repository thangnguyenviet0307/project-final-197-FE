import { Button } from '@/components/ui/button';
import { CatalogImage } from '@/components/catalog-image';
import type { SelectedImage } from '@/hooks/use-selected-image';

export function ImageUploadField({
  id,
  label,
  selected,
  existingUrl,
  error,
  disabled,
  onSelect,
}: {
  id: string;
  label: string;
  selected: SelectedImage | null;
  existingUrl?: string;
  error: string;
  disabled: boolean;
  onSelect: (file: File | null) => void;
}) {
  return (
    <div className="space-y-3">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        key={selected?.url ?? 'empty'}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={disabled}
        onChange={(event) => onSelect(event.target.files?.[0] ?? null)}
        className="file:bg-muted block w-full min-w-0 text-sm file:mr-3 file:rounded-lg file:border file:px-3 file:py-2"
      />
      <p className="text-muted-foreground text-xs">
        JPG, PNG, WebP · Tối đa 5 MB. Ảnh được tải lên khi lưu biểu mẫu.
      </p>
      {(selected || existingUrl) && (
        <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-lg border p-3">
          <div className="size-20 shrink-0 [&>*]:size-full">
            {selected ? (
              <img
                src={selected.url}
                alt={`Xem trước ${label.toLowerCase()}`}
                className="rounded-lg object-contain"
              />
            ) : (
              <CatalogImage
                src={existingUrl}
                alt={`Xem trước ${label.toLowerCase()}`}
              />
            )}
          </div>
          {selected && (
            <>
              <p className="min-w-0 flex-1 text-sm break-all">
                {selected.file.name}
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={disabled}
                onClick={() => onSelect(null)}
              >
                Bỏ ảnh đã chọn
              </Button>
            </>
          )}
        </div>
      )}
      {error && (
        <div role="alert" className="text-destructive text-sm">
          <p>{error}</p>
          <Button
            type="button"
            variant="link"
            disabled={disabled}
            onClick={() => onSelect(null)}
          >
            Bỏ lựa chọn ảnh không hợp lệ
          </Button>
        </div>
      )}
    </div>
  );
}
