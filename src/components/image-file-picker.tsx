import { useRef, type ChangeEventHandler } from 'react';
import { ImagePlus } from 'lucide-react';

export function ImageFilePicker({
  id,
  multiple = false,
  disabled = false,
  selectionText,
  onChange,
}: {
  id: string;
  multiple?: boolean;
  disabled?: boolean;
  selectionText: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-3">
      <input
        ref={input}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        disabled={disabled}
        tabIndex={-1}
        aria-describedby={`${id}-selection`}
        className="sr-only"
        onChange={onChange}
      />
      <button
        type="button"
        disabled={disabled}
        aria-controls={id}
        onClick={() => input.current?.click()}
        className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:border-green-700 hover:bg-green-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ImagePlus className="size-4" aria-hidden="true" />
        Chọn ảnh
      </button>
      <span
        id={`${id}-selection`}
        className="min-w-0 text-sm break-all text-gray-600"
        aria-live="polite"
      >
        {selectionText}
      </span>
    </div>
  );
}
