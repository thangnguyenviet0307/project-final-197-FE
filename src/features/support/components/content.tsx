import ReactQuill from 'react-quill-new';
import { useEffect, useId, useRef } from 'react';
import {
  descriptionToHtml,
  sanitizeDescription,
} from '@/features/products/utils/product-description';
import 'react-quill-new/dist/quill.snow.css';
import '@/features/products/components/product-description.css';

const modules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'link'],
    ['clean'],
  ],
};
const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'list',
  'blockquote',
  'link',
];
export function ContentEditor({
  value,
  onChange,
  disabled,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  label: string;
}) {
  const editor = useRef<ReactQuill>(null);
  const id = useId();
  useEffect(() => {
    const root = editor.current?.getEditor().root;
    if (root) {
      root.id = id;
      root.setAttribute('role', 'textbox');
      root.setAttribute('aria-label', label);
      root.setAttribute('aria-multiline', 'true');
    }
  }, [id, label]);
  return (
    <div className="product-description-editor" aria-disabled={disabled}>
      <ReactQuill
        ref={editor}
        theme="snow"
        value={descriptionToHtml(value)}
        modules={modules}
        formats={formats}
        readOnly={disabled}
        onChange={(html, _delta, source, instance) => {
          if (source === 'user')
            onChange(
              instance.getText().trim() ? sanitizeDescription(html) : ''
            );
        }}
      />
    </div>
  );
}
export function ContentBody({ value }: { value: string }) {
  return (
    <div
      className="product-description-content break-words leading-8"
      dangerouslySetInnerHTML={{ __html: descriptionToHtml(value) }}
    />
  );
}
