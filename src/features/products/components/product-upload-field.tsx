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
    path: FieldPath<ProductFormValues>,
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
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );
  const select = uploads?.select;
  useEffect(() => {
    if (!file || !select) return;
    select(key, name, file);
    return () => select(key, name, null);
  }, [file, key, name, select]);
  const stored = form.watch(name);
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        ref={input}
        id={name}
        type="file"
        hidden
        aria-describedby={`${key}-selection`}
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          if (
            !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
            !file.size ||
            file.size > 5 * 1024 * 1024
          ) {
            setError('Chọn ảnh JPG, PNG hoặc WebP, tối đa 5 MB.');
            event.target.value = '';
            return;
          }
          setError('');
          setPreview(URL.createObjectURL(file));
          setFile(file);
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
          {file?.name ?? 'Chưa chọn ảnh'}
        </span>
      </div>
      <p className="text-muted-foreground text-xs">
        JPG, PNG hoặc WebP, tối đa 5 MB. Ảnh được tải lên khi lưu sản phẩm.
      </p>
      {(preview || (typeof stored === 'string' && stored)) && (
        <ProductImage
          src={preview || String(stored)}
          alt={label}
          className="size-20 border"
        />
      )}
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </Field>
  );
}
