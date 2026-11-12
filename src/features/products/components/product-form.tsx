import { Controller, useForm, useWatch, type FieldPath } from 'react-hook-form';
import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getProduct,
  uploadProductImage,
  updateProduct,
} from '@/features/products/services/products.service';
import {
  ProductUploadField,
  ProductUploadsContext,
} from './product-upload-field';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { useBrands } from '@/features/brands/hooks/use-brands';
import {
  productDefaults,
  productPayload,
  productUpdatePayload,
  productSchema,
  productEditSchema,
  productErrorPath,
  type ProductFormValues,
} from '@/features/products/schemas/product-schema';
import type {
  CatalogReference,
  Product,
  ProductInput,
} from '@/features/products/types/products';
import { getApiError } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { ProductDescriptionEditor } from '@/features/products/components/product-description-editor';
import { SearchableSelect } from '@/components/searchable-select';
import { searchText } from '@/utils/search-text';
import { Input } from '@/components/ui/input';
import {
  ProductInputField,
  ProductVariantsFields,
} from '@/features/products/components/product-variants-fields';
import { useUnsavedProductChanges } from '@/features/products/hooks/use-unsaved-product-changes';
import { useProductListLocation } from '@/features/products/hooks/use-product-list-location';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ContentSkeleton } from '@/components/page-skeleton';
import { ProductDetailsFields } from '@/features/products/components/product-details-fields';

type ProductFormProps = { pending: boolean } & (
  | { product?: undefined; save: (input: ProductInput) => Promise<Product> }
  | {
      product: Product;
      save: (
        input: Partial<ProductInput>,
        original: Product
      ) => Promise<Product>;
    }
);

export function ProductForm({ product, save, pending }: ProductFormProps) {
  const navigate = useNavigate();
  const categories = useCategories();
  const brands = useBrands();
  const [original] = useState(product);
  const [categorySearch, setCategorySearch] = useState('');
  const client = useQueryClient();
  const files = useRef(
    new Map<string, { path: FieldPath<ProductFormValues> | null; file: File }>()
  );
  const savedProduct = useRef<Product | undefined>(undefined);
  const uploadedFields = useRef(new Set<string>());
  const retryImageLink = useRef(false);
  const [hasFiles, setHasFiles] = useState(false);
  const [finishingImages, setFinishingImages] = useState(false);
  const selectFile = useCallback(
    (
      key: string,
      path: FieldPath<ProductFormValues> | null,
      file: File | null
    ) => {
      if (file) files.current.set(key, { path, file });
      else files.current.delete(key);
      setHasFiles(files.current.size > 0);
    },
    []
  );
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(
      original ? productEditSchema(original) : productSchema
    ),
    defaultValues: productDefaults(original),
  });
  const { dirtyFields, isDirty } = form.formState;
  const { blocker, allowSavedNavigation } = useUnsavedProductChanges(
    isDirty || hasFiles || finishingImages
  );
  const returnTo = useProductListLocation();
  const variants = useWatch({ control: form.control, name: 'variants' });
  const primaryCategory = useWatch({ control: form.control, name: 'category' });
  const busy = pending || form.formState.isSubmitting;
  const catalogLoading = categories.isPending || brands.isPending;
  const catalogError = categories.error || brands.error;
  const categoryChoices = (categories.data ?? []).filter(
    (item) => item.isActive !== false && !item.isDeleted && !item.parent
  );
  const brandChoices = (brands.data ?? []).filter(
    (item) => item.isActive !== false && !item.isDeleted
  );

  function catalogField(
    name: 'category' | 'brand',
    label: string,
    choices: CatalogReference[]
  ) {
    const reference = product?.[name];
    const required = !product || Boolean(reference);
    const current =
      typeof reference === 'string'
        ? (name === 'category' ? categories.data : brands.data)?.find(
            (item) => item._id === reference
          )
        : reference;
    const unavailable =
      typeof current === 'object' &&
      current &&
      !choices.some((item) => item._id === current._id)
        ? current
        : null;
    return (
      <Controller
        control={form.control}
        name={name}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor={name} required={required}>
              {label}
            </FieldLabel>
            <SearchableSelect
              id={name}
              searchLabel={`Tìm ${label.toLocaleLowerCase('vi-VN')}`}
              value={field.value}
              onChange={field.onChange}
              required={required}
              invalid={!!fieldState.error}
              describedBy={`${name}-error`}
              onBlur={field.onBlur}
              ref={field.ref}
              options={[
                ...(unavailable
                  ? [
                      {
                        value: unavailable._id,
                        label: `${unavailable.name} (giá trị hiện tại)`,
                        disabled: true,
                      },
                    ]
                  : []),
                ...choices.map((item) => ({
                  value: item._id,
                  label: item.name,
                })),
              ]}
            />
            <FieldError id={`${name}-error`} errors={[fieldState.error]} />
          </Field>
        )}
      />
    );
  }

  return (
    <ProductUploadsContext.Provider value={{ select: selectFile }}>
      <form
        noValidate
        className="space-y-6"
        onSubmit={(event) => {
          void form.handleSubmit(async (values) => {
            try {
              form.clearErrors('root');
              if (
                !savedProduct.current &&
                files.current.size + (product?.images?.length ?? 0) > 8
              )
                throw new Error(
                  'Thư viện tối đa 8 ảnh. Hãy chọn ít ảnh hơn hoặc xóa ảnh cũ ở trang chi tiết sản phẩm.'
                );
              if (!savedProduct.current && product && original) {
                const input = productUpdatePayload(
                  values,
                  dirtyFields,
                  original
                );
                savedProduct.current = Object.keys(input).length
                  ? await save(input, original)
                  : product;
              } else if (!savedProduct.current && !product) {
                savedProduct.current = await save(productPayload(values));
              }
              if (hasFiles || finishingImages) {
                setFinishingImages(true);
                for (const [key, { path, file }] of files.current) {
                  const uploaded = await uploadProductImage({
                    id: savedProduct.current!._id,
                    file,
                  });
                  savedProduct.current = uploaded;
                  const image = uploaded.images?.at(-1);
                  if (!image)
                    throw new Error('Không nhận được ảnh đã tải lên.');
                  if (path?.endsWith('.images')) {
                    const arrayPath = path as `variants.${number}.images`;
                    const existing = form.getValues(arrayPath) ?? [];
                    form.setValue(
                      arrayPath,
                      [...existing, { url: image.secure_url }],
                      { shouldDirty: true }
                    );
                    uploadedFields.current.add(
                      `${arrayPath}.${existing.length}.url`
                    );
                  } else if (path) {
                    form.setValue(path, image.secure_url, {
                      shouldDirty: true,
                    });
                    uploadedFields.current.add(path);
                  }
                  files.current.delete(key);
                }
                const imagesPayload = productPayload(form.getValues());
                // After an uncertain response or version conflict, read the latest
                // metadata/inventory and attach images to immutable variant IDs.
                const imageBase = savedProduct.current!;
                const latest = retryImageLink.current
                  ? await getProduct(imageBase._id)
                  : imageBase;
                const draftIndex = (
                  variant: NonNullable<Product['variants']>[number]
                ) => {
                  const base = imageBase.variants?.find(
                    (item) => item._id === variant._id
                  );
                  return (
                    imagesPayload.variants?.findIndex(
                      (item) =>
                        item._id === variant._id || item.sku === base?.sku
                    ) ?? -1
                  );
                };
                const hasVariantImages = (index: number) =>
                  [...uploadedFields.current].some(
                    (path) =>
                      path === `variants.${index}.image` ||
                      path.startsWith(`variants.${index}.images.`)
                  );
                if (
                  imageBase.variants?.some(
                    (variant) =>
                      hasVariantImages(draftIndex(variant)) &&
                      !latest.variants?.some((item) => item._id === variant._id)
                  )
                ) {
                  throw new Error(
                    'Biến thể đã bị xóa. Ảnh đã tải vẫn nằm trong thư viện; hãy mở lại sản phẩm để kiểm tra.'
                  );
                }
                retryImageLink.current = true;
                savedProduct.current = await updateProduct({
                  id: savedProduct.current!._id,
                  input: {
                    ...(uploadedFields.current.has('thumbnail')
                      ? { thumbnail: imagesPayload.thumbnail }
                      : {}),
                    ...([...uploadedFields.current].some((path) =>
                      path.startsWith('variants.')
                    )
                      ? {
                          variants: latest.variants?.map((variant) => {
                            const index = draftIndex(variant);
                            const draft =
                              index === undefined || index < 0
                                ? undefined
                                : imagesPayload.variants?.[index];
                            return {
                              ...variant,
                              ...(uploadedFields.current.has(
                                `variants.${index}.image`
                              )
                                ? { image: draft?.image }
                                : {}),
                              ...([...uploadedFields.current].some((path) =>
                                path.startsWith(`variants.${index}.images.`)
                              )
                                ? { images: draft?.images }
                                : {}),
                            };
                          }),
                          ...(latest.price !== undefined
                            ? { price: latest.price }
                            : {}),
                          expectedVersion: latest.__v ?? 0,
                        }
                      : {}),
                  },
                });
                retryImageLink.current = false;
                await client.invalidateQueries({ queryKey: ['products'] });
              }
              allowSavedNavigation();
              navigate(
                product
                  ? `/auth/products/${product.slug || product._id}`
                  : returnTo,
                {
                  state: { returnTo },
                }
              );
            } catch (error: unknown) {
              const failure = getApiError(error);
              form.setError('root', {
                message: savedProduct.current
                  ? `Sản phẩm đã được lưu. ${failure.message} Bấm lưu để thử lại phần ảnh còn lại; sản phẩm sẽ không được tạo lại.`
                  : failure.message,
              });
              failure.errors?.forEach(({ field, message }) => {
                const path = productErrorPath(field, values);
                if (path) {
                  form.setError(path as FieldPath<ProductFormValues>, {
                    message,
                  });
                }
              });
            }
          })(event);
        }}
      >
        {catalogLoading && (
          <ContentSkeleton
            label="Đang tải danh mục và thương hiệu…"
            variant="form"
          />
        )}
        {catalogError && (
          <div role="alert" className="text-destructive">
            {getApiError(catalogError).message}{' '}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void categories.refetch();
                void brands.refetch();
              }}
            >
              Thử lại
            </Button>
          </div>
        )}
        {!catalogLoading &&
          !catalogError &&
          (!categoryChoices.length || !brandChoices.length) && (
            <p role="alert">
              Cần có danh mục và thương hiệu đang hoạt động để tạo sản phẩm.
            </p>
          )}
        <fieldset
          hidden={catalogLoading}
          disabled={busy || finishingImages || catalogLoading || !!catalogError}
          className="space-y-6 disabled:opacity-70"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <ProductInputField
              form={form}
              name="product_name"
              label="Tên sản phẩm"
            />
            <ProductInputField
              form={form}
              name="model_year"
              label="Năm sản xuất"
              numeric
              optional
            />
            {catalogField('category', 'Danh mục', categoryChoices)}
            {catalogField('brand', 'Thương hiệu', brandChoices)}
            <Controller
              control={form.control}
              name="categories"
              render={({ field, fieldState }) => (
                <Field className="sm:col-span-2">
                  <FieldLabel>Danh mục bổ sung</FieldLabel>
                  <Input
                    aria-label="Tìm danh mục bổ sung"
                    placeholder="Tìm danh mục bổ sung…"
                    value={categorySearch}
                    onChange={(event) => setCategorySearch(event.target.value)}
                  />
                  <p className="text-muted-foreground text-xs">
                    Có thể chọn nhiều danh mục. Ô Danh mục phía trên là danh mục
                    chính.
                  </p>
                  <div
                    role="group"
                    aria-label="Danh mục bổ sung"
                    className="grid max-h-56 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2"
                  >
                    {(categories.data ?? [])
                      .filter(
                        (item) =>
                          item._id !== primaryCategory &&
                          ((item.isActive !== false && !item.isDeleted) ||
                            field.value?.includes(item._id)) &&
                          searchText(item.name).includes(
                            searchText(categorySearch)
                          )
                      )
                      .map((item) => (
                        <label
                          key={item._id}
                          className="flex items-start gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={field.value?.includes(item._id) ?? false}
                            onBlur={field.onBlur}
                            onChange={(event) =>
                              field.onChange(
                                event.target.checked
                                  ? [...(field.value ?? []), item._id]
                                  : field.value?.filter((id) => id !== item._id)
                              )
                            }
                          />
                          <span>
                            {item.name}
                            {!item.isActive || item.isDeleted
                              ? ' (không hoạt động)'
                              : ''}
                          </span>
                        </label>
                      ))}
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <ProductInputField
              form={form}
              name="price"
              label="Giá (không bắt buộc; mặc định là giá biến thể thấp nhất)"
              numeric
              optional
            />
            <ProductInputField
              form={form}
              name="discount"
              label="Giảm giá (%)"
              numeric
            />
            <ProductUploadField
              form={form}
              name="thumbnail"
              label="Ảnh sản phẩm"
            />
            {variants.length ? (
              <Field>
                <FieldLabel>Tổng tồn kho</FieldLabel>
                <output className="text-sm">
                  {variants.reduce(
                    (total, variant) => total + (Number(variant.stock) || 0),
                    0
                  )}
                </output>
                <p className="text-muted-foreground text-xs">
                  Được tính từ tồn kho của các biến thể.
                </p>
              </Field>
            ) : (
              <ProductInputField
                form={form}
                name="stock"
                label="Tồn kho"
                numeric
                optional
              />
            )}
          </div>
          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="description">Mô tả</FieldLabel>
                <ProductDescriptionEditor
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={busy || catalogLoading || !!catalogError}
                  invalid={!!fieldState.error}
                />
                <FieldError
                  id="description-error"
                  errors={[fieldState.error]}
                />
              </Field>
            )}
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register('is_active')} />
            Sản phẩm đang hoạt động
          </label>
          <fieldset className="flex flex-wrap gap-4">
            <legend>Hiển thị sản phẩm</legend>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...form.register('on_sale')} />
              On sale - Đang bán
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...form.register('is_new')}
                onChange={(event) => {
                  for (const name of [
                    'is_best_seller',
                    'is_new',
                    'is_hot',
                  ] as const)
                    form.setValue(
                      name,
                      name === 'is_new' && event.target.checked,
                      { shouldDirty: true }
                    );
                }}
              />
              New - Mới
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...form.register('is_hot')}
                onChange={(event) => {
                  for (const name of [
                    'is_best_seller',
                    'is_new',
                    'is_hot',
                  ] as const)
                    form.setValue(
                      name,
                      name === 'is_hot' && event.target.checked,
                      { shouldDirty: true }
                    );
                }}
              />
              Hot - Nổi bật
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...form.register('is_home')} />
              Home - Trang chủ
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...form.register('is_best_seller')}
                onChange={(event) => {
                  for (const name of [
                    'is_best_seller',
                    'is_new',
                    'is_hot',
                  ] as const)
                    form.setValue(
                      name,
                      name === 'is_best_seller' && event.target.checked,
                      { shouldDirty: true }
                    );
                }}
              />
              Best Seller - Bán chạy
            </label>
          </fieldset>
          <ProductDetailsFields form={form} />
          <ProductVariantsFields form={form} />
        </fieldset>
        {form.formState.errors.root && (
          <p role="alert" className="text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            disabled={
              busy ||
              catalogLoading ||
              !!catalogError ||
              (!product && (!categoryChoices.length || !brandChoices.length))
            }
          >
            {busy && <LoaderCircle className="animate-spin" />}
            {finishingImages
              ? 'Hoàn tất tải ảnh'
              : product
                ? 'Lưu thay đổi'
                : 'Tạo sản phẩm'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() =>
              navigate(
                product
                  ? `/auth/products/${product.slug || product._id}`
                  : returnTo,
                {
                  state: { returnTo },
                }
              )
            }
          >
            Hủy
          </Button>
        </div>
        <Dialog
          open={blocker.state === 'blocked'}
          onOpenChange={(open) => {
            if (!open && blocker.state === 'blocked') blocker.reset();
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bỏ các thay đổi chưa lưu?</DialogTitle>
              <DialogDescription>
                Thay đổi sản phẩm chưa được lưu. Rời trang sẽ làm mất các thay
                đổi này.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (blocker.state === 'blocked') blocker.reset();
                }}
              >
                Tiếp tục chỉnh sửa
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  if (blocker.state === 'blocked') blocker.proceed();
                }}
              >
                Bỏ thay đổi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form>
    </ProductUploadsContext.Provider>
  );
}
