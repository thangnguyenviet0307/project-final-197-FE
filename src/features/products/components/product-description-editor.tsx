import { PRODUCT_DESCRIPTION_MAX_LENGTH } from '@/features/products/constants';
import { RichTextEditor } from '@/components/rich-text-editor';
import 'react-quill-new/dist/quill.snow.css';
import '@/features/products/components/product-description.css';

export function ProductDescriptionEditor({
  value,
  onChange,
  onBlur,
  disabled,
  invalid,
}: {
  value: string;
  onChange: (html: string) => void;
  onBlur: () => void;
  disabled: boolean;
  invalid: boolean;
}) {
  return (
    <div
      className="product-description-editor min-w-0"
      aria-disabled={disabled}
    >
      <RichTextEditor
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        invalid={invalid}
        label="Mô tả"
        id="description"
        describedBy="description-hint description-error"
      />
      <p id="description-hint" className="text-muted-foreground mt-2 text-xs">
        {value.length.toLocaleString('vi-VN')}/
        {PRODUCT_DESCRIPTION_MAX_LENGTH.toLocaleString('vi-VN')} ký tự, bao gồm
        định dạng và đường dẫn ảnh.
      </p>
    </div>
  );
}
