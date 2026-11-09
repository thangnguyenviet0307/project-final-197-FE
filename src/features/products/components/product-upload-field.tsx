import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import type { FieldPath, UseFormReturn } from 'react-hook-form';
import type { ProductFormValues } from '@/features/products/schemas/product-schema';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { ProductImage } from './product-image';

export const ProductUploadsContext = createContext<{
  select: (
    key: string,
    path: FieldPath<ProductFormValues> | null,
    file: File | null
  ) => void;
} | null>(null);

export function ProductUploadField({
  form,
  name,
  label,
}: {
  form: UseFormReturn<ProductFormValues>;
  name: FieldPath<ProductFormValues>;
  label: string;
}) {
  const uploads = useContext(ProductUploadsContext);
  const key = useId();
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  useEffect(
    () => () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    },
    [previews]
  );
  const select = uploads?.select;
  useEffect(() => {
    if (!files.length || !select) return;
    const variant = /^variants\.(\d+)\./.exec(name);
    files.forEach((file, index) => {
      const path = index === 0 ? name : variant
        ? `variants.${variant[1]}.images` as FieldPath<ProductFormValues>
        : null;
      select(`${key}-${index}`, path, file);
    });
    return () => files.forEach((_, index) => select(`${key}-${index}`, null, null));
  }, [files, key, name, select]);
  const stored = form.watch(name);
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        ref={input}
        id={name}
        type="file"
        multiple
        hidden
        aria-describedby={`${key}-selection`}
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          const selected = Array.from(event.target.files ?? []);
          event.target.value = '';
          if (!selected.length) return;
          if (selected.length > 5) {
            setError('Chọn tối đa 5 ảnh mỗi lần.');
            return;
          }
          if (selected.some((file) =>
            !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
            !file.size || file.size > 5 * 1024 * 1024
          )) {
            setError('Chọn ảnh JPG, PNG hoặc WebP, tối đa 5 MB mỗi ảnh.');
            return;
          }
          setError('');
          setPreviews(selected.map((file) => URL.createObjectURL(file)));
          setFiles(selected);
        }}
      />
      <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-lg border p-2">
        <Button
          type="button"
          variant="outline"
          aria-label={`Chọn ${label.toLowerCase()}`}
          aria-describedby={`${key}-selection`}
          onClick={() => input.current?.click()}
        >
          <Upload aria-hidden="true" />
          Chọn ảnh
        </Button>
        <span
          id={`${key}-selection`}
          className="text-muted-foreground min-w-0 flex-1 text-sm break-all"
          aria-live="polite"
        >
          {files.length ? files.map((file) => file.name).join(', ') : 'Chưa chọn ảnh'}
        </span>
      </div>
      <p className="text-muted-foreground text-xs">
        Chọn tối đa 5 ảnh mỗi lần, JPG, PNG hoặc WebP, tối đa 5 MB mỗi ảnh. Ảnh đầu tiên làm ảnh chính; các ảnh còn lại vào thư viện. Ảnh được tải lên khi lưu sản phẩm.
      </p>
      <div className="flex flex-wrap gap-2">
        {(previews.length ? previews : typeof stored === 'string' && stored ? [stored] : []).map((src, index) => (
          <ProductImage key={`${src}-${index}`} src={src} alt={`${label} ${index + 1}`} className="size-20 border" />
        ))}
      </div>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </Field>
  );
}
