import { useUnsavedForm } from '@/hooks/use-unsaved-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { ImageUploadField } from '@/components/image-upload-field';
import { useSelectedImage } from '@/hooks/use-selected-image';
import {
  categorySchema,
  type CategoryFormInput,
} from '@/features/categories/schemas/category-schema';
import type { Category } from '@/features/categories/types/categories';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { getApiError } from '@/services/api';

export function CategoryForm({
  category,
  onSubmit,
  onSaved,
  onCancel,
}: {
  category?: Category;
  onSubmit: (values: CategoryFormInput & { image?: File }) => Promise<unknown>;
  onSaved?: () => void;
  onCancel: () => void;
}) {
  const categories = useCategories();
  const form = useForm<CategoryFormInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? '',
      description: category?.description ?? '',
      icon: category?.icon ?? '',
      parent:
        typeof category?.parent === 'object'
          ? (category.parent?._id ?? null)
          : (category?.parent ?? null),
      isActive: category?.isActive ?? true,
    },
  });
  const image = useSelectedImage();
  const navigation = useUnsavedForm(
    form.formState.isDirty || !!image.selected || form.formState.isSubmitting
  );
  const busy = form.formState.isSubmitting;
  return (
    <>
      <form
        aria-label={category ? 'Chỉnh sửa danh mục' : 'Tạo danh mục'}
        noValidate
        className="max-w-3xl space-y-6"
        onSubmit={form.handleSubmit(async (values) => {
          form.clearErrors();
          try {
            await onSubmit({
              ...values,
              ...(image.selected ? { image: image.selected.file } : {}),
            });
            navigation.allowSavedNavigation();
            onSaved?.();
          } catch (error) {
            form.setError('root', { message: getApiError(error).message });
          }
        })}
      >
        <fieldset disabled={busy} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="category-name">Tên danh mục</FieldLabel>
            <Input
              id="category-name"
              {...form.register('name')}
              aria-invalid={!!form.formState.errors.name}
            />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>
          <ImageUploadField
            id="category-icon"
            label="Ảnh danh mục"
            selected={image.selected}
            existingUrl={category?.icon}
            error={image.error}
            disabled={busy}
            onSelect={image.select}
          />
          <Field>
            <FieldLabel htmlFor="category-description">Mô tả</FieldLabel>
            <Textarea
              id="category-description"
              rows={5}
              {...form.register('description')}
            />
            <FieldError errors={[form.formState.errors.description]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="category-parent">Danh mục cha</FieldLabel>
            <select
              id="category-parent"
              className="bg-background h-8 rounded-md border px-2 text-sm"
              {...form.register('parent', {
                setValueAs: (value) => value || null,
              })}
              disabled={categories.isPending || categories.isError}
            >
              <option value="">Không có (danh mục gốc)</option>
              {categories.data
                ?.filter((item) => item._id !== category?._id)
                .map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
            </select>
          </Field>
          {categories.isError && (
            <div role="alert">
              <p>{getApiError(categories.error).message}</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void categories.refetch()}
              >
                Tải lại danh mục
              </Button>
            </div>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register('isActive')} />
            Danh mục đang hoạt động
          </label>
        </fieldset>
        {form.formState.errors.root && (
          <p role="alert" className="text-destructive text-sm">
            {form.formState.errors.root.message}
          </p>
        )}
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={
              busy ||
              !!image.error ||
              categories.isPending ||
              categories.isError
            }
          >
            {busy ? 'Saving...' : category ? 'Lưu thay đổi' : 'Tạo danh mục'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => navigation.confirmDiscard(onCancel)}
          >
            Hủy
          </Button>
        </div>
      </form>
      {navigation.guard}
    </>
  );
}
