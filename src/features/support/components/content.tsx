import { RichTextEditor } from '@/components/rich-text-editor';
import { RequiredMark } from '@/components/required-mark';
import { descriptionToHtml } from '@/features/products/utils/product-description';
import 'react-quill-new/dist/quill.snow.css';
import '@/features/products/components/product-description.css';

export function ContentEditor({
  value,
  onChange,
  disabled,
  label,
  requiredOnPublish = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  label: string;
  requiredOnPublish?: boolean;
}) {
  return (
    <div className="product-description-editor" aria-disabled={disabled}>
      {requiredOnPublish && (
        <p className="mb-2 text-sm">
          {label}
          <RequiredMark />{' '}
          <span className="text-muted-foreground">
            Bắt buộc khi công bố; bản nháp có thể để trống.
          </span>
        </p>
      )}
      <RichTextEditor
        value={value}
        onChange={onChange}
        disabled={disabled}
        label={label}
      />
    </div>
  );
}
export function ContentBody({ value }: { value: string }) {
  return (
    <div
      className="product-description-content leading-8 break-words"
      dangerouslySetInnerHTML={{ __html: descriptionToHtml(value) }}
    />
  );
}
