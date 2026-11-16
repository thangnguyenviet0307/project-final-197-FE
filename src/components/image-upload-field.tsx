import { useRef } from 'react';
import { Upload } from 'lucide-react';
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
  guidance,
  onSelect,
}: {
  id: string;
  label: string;
  selected: SelectedImage | null;
  existingUrl?: string;
  error: string;
  disabled: boolean;
  guidance?: string;
  onSelect: (file: File | null) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-3">
      <span className="text-sm font-medium">
        {label}
      </span>
      <input
        key={selected?.url ?? 'empty'}
        id={id}
        aria-label={label}
        ref={input}
        type="file"
        hidden
        accept="image/jpeg,image/png,image/webp"
        aria-describedby={guidance ? `${id}-guidance` : undefined}
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) onSelect(file);
        }}
      />
      <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-lg border p-2">
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          disabled={disabled}
          aria-label={`Chọn ${label.toLowerCase()}`}
          aria-describedby={`${id}-selection`}
          onClick={() => input.current?.click()}
        >
          <Upload aria-hidden="true" />
          Chọn ảnh
        </Button>
        <span id={`${id}-selection`} className="text-muted-foreground min-w-0 flex-1 text-sm break-all" aria-live="polite">
          {selected?.file.name ?? 'Chưa chọn ảnh'}
        </span>
      </div>
      <p className="text-muted-foreground text-xs">
        JPG, PNG, WebP · Tối đa 5 MB. Ảnh được tải lên khi lưu biểu mẫu.
      </p>
      {guidance && (
        <p
          id={`${id}-guidance`}
          className="text-muted-foreground text-sm leading-6"
        >
          {guidance}
        </p>
      )}
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
