import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReactQuill from 'react-quill-new';
import { Undo2, Redo2 } from 'lucide-react';
import { descriptionToHtml, richTextValue } from '@/utils/rich-text';
import { uploadEditorImage } from '@/services/editor-image.service';
import { getApiError } from '@/services/api';
import { validateImageFile } from '@/utils/image-file';
import 'react-quill-new/dist/quill.snow.css';

const formats = [
  'header',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'indent',
  'align',
  'blockquote',
  'link',
  'image',
];
export function RichTextEditor({
  value,
  onChange,
  onBlur,
  disabled,
  label,
  invalid = false,
  describedBy,
  id,
}: {
  value: string;
  onChange: (html: string) => void;
  onBlur?: (() => void) | undefined;
  disabled: boolean;
  label: string;
  invalid?: boolean;
  describedBy?: string;
  id?: string;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const editor = useRef<ReactQuill>(null);
  const selection = useRef<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);
  const current = useRef({ disabled, value });
  useLayoutEffect(() => {
    current.current = { disabled, value };
  }, [disabled, value]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const modules = useMemo(
    () => ({
      history: { delay: 800, maxStack: 100, userOnly: true },
      toolbar: {
        container: [
          [
            { header: [1, 2, 3, false] },
            { size: ['small', false, 'large', 'huge'] },
          ],
          ['bold', 'italic', 'underline', 'strike'],
          [
            { list: 'ordered' },
            { list: 'bullet' },
            { indent: '-1' },
            { indent: '+1' },
          ],
          [{ align: [false, 'center', 'right', 'justify'] }],
          ['blockquote', 'link', 'image'],
          ['clean'],
        ],
        handlers: {
          image: () => {
            if (!current.current.disabled && !controller.current)
              fileInput.current?.click();
          },
        },
      },
    }),
    []
  );
  async function insertImage(file: File) {
    if (current.current.disabled || controller.current) return;
    const validation = validateImageFile(file);
    if (validation) {
      setError(validation);
      return;
    }
    const quill = editor.current?.getEditor();
    if (!quill) return;
    const index =
      quill.getSelection()?.index ??
      selection.current ??
      Math.max(0, quill.getLength() - 1);
    const originalValue = current.current.value;
    const request = new AbortController();
    controller.current = request;
    setError('');
    setUploading(true);
    try {
      const { url } = await uploadEditorImage(file, request.signal);
      if (
        request.signal.aborted ||
        current.current.disabled ||
        current.current.value !== originalValue
      )
        return;
      if (new URL(url).protocol !== 'https:')
        throw new Error('Invalid image URL');
      quill.history.cutoff();
      quill.enable(true);
      const position = Math.min(index, quill.getLength() - 1);
      quill.insertEmbed(position, 'image', url, 'user');
      quill.formatText(position, 1, { alt: file.name }, 'user');
      quill.setSelection(position + 1, 0, 'silent');
      quill.history.cutoff();
      setError('');
    } catch (failure) {
      if (!request.signal.aborted) setError(getApiError(failure).message);
    } finally {
      if (!request.signal.aborted) {
        setUploading(false);
        controller.current = null;
      }
    }
  }
  const insert = useRef(insertImage);
  useLayoutEffect(() => {
    insert.current = insertImage;
  });
  useEffect(
    () => () => {
      controller.current?.abort();
      controller.current = null;
    },
    []
  );
  useEffect(() => {
    const root = editor.current?.getEditor().root;
    if (!root) return;
    root.id = inputId;
    root.setAttribute('role', 'textbox');
    root.setAttribute('aria-label', label);
    root.setAttribute('aria-multiline', 'true');
    root.setAttribute('aria-invalid', String(invalid));
    if (describedBy) root.setAttribute('aria-describedby', describedBy);
    const names: Record<string, string> = {
      bold: 'In đậm',
      italic: 'In nghiêng',
      underline: 'Gạch chân',
      strike: 'Gạch ngang',
      blockquote: 'Trích dẫn',
      link: 'Chèn liên kết',
      image: 'Chèn hình ảnh',
      clean: 'Xóa định dạng',
      align: 'Căn lề',
      header: 'Tiêu đề',
      size: 'Cỡ chữ',
      list: 'Danh sách',
      indent: 'Thụt lề',
    };
    container.current
      ?.querySelectorAll('.ql-toolbar button, .ql-toolbar select')
      .forEach((control) => {
        const name = [...control.classList].find(
          (item) => names[item.replace('ql-', '')]
        );
        if (name) {
          control.setAttribute('title', names[name.replace('ql-', '')]!);
          control.setAttribute('aria-label', names[name.replace('ql-', '')]!);
        }
      });
  }, [inputId, label, invalid, describedBy]);
  useEffect(() => {
    const root = editor.current?.getEditor().root;
    if (!root) return;
    const paste = (event: ClipboardEvent) => {
      const file = [...(event.clipboardData?.files ?? [])].find((item) =>
        item.type.startsWith('image/')
      );
      if (file) {
        event.preventDefault();
        event.stopImmediatePropagation();
        void insert.current(file);
      }
    };
    const dragover = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes('Files')) event.preventDefault();
    };
    const drop = (event: DragEvent) => {
      const file = [...(event.dataTransfer?.files ?? [])][0];
      if (file) {
        event.preventDefault();
        event.stopImmediatePropagation();
        void insert.current(file);
      }
    };
    root.addEventListener('paste', paste, true);
    root.addEventListener('dragover', dragover);
    root.addEventListener('drop', drop, true);
    return () => {
      root.removeEventListener('paste', paste, true);
      root.removeEventListener('dragover', dragover);
      root.removeEventListener('drop', drop, true);
    };
  }, []);
  useEffect(() => {
    if (!uploading) return;
    const form = container.current?.closest('form');
    const block = (event: Event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      setError('Ảnh đang được tải lên. Vui lòng chờ trước khi lưu.');
    };
    form?.addEventListener('submit', block, true);
    return () => form?.removeEventListener('submit', block, true);
  }, [uploading]);
  return (
    <div
      ref={container}
      className="product-description-editor min-w-0"
      aria-disabled={disabled || uploading}
      aria-busy={uploading}
    >
      <div className="rich-text-history">
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => editor.current?.getEditor().history.undo()}
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo2 size={15} /> Hoàn tác
        </button>
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => editor.current?.getEditor().history.redo()}
          title="Làm lại (Ctrl+Shift+Z)"
        >
          <Redo2 size={15} /> Làm lại
        </button>
      </div>
      <ReactQuill
        ref={editor}
        theme="snow"
        value={descriptionToHtml(value)}
        modules={modules}
        formats={formats}
        readOnly={disabled || uploading}
        onBlur={onBlur}
        onChangeSelection={(range) => {
          if (range) selection.current = range.index;
        }}
        onChange={(html, _delta, source) => {
          if (source === 'user') onChange(richTextValue(html));
        }}
      />
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label={`Chọn ảnh cho ${label}`}
        disabled={disabled || uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void insertImage(file);
        }}
      />
      <p className="text-muted-foreground mt-2 text-xs">
        Chọn đoạn văn để căn lề hoặc định dạng. Chèn, dán hoặc kéo ảnh
        JPG/PNG/WebP vào nội dung (tối đa 5 MB/ảnh).
      </p>
      {uploading && (
        <p role="status" className="mt-2 text-sm">
          Đang tải ảnh lên…
        </p>
      )}
      {error && (
        <p role="alert" className="text-destructive mt-2 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
