import { LoadingSkeleton } from '@/components/loading-skeleton';
import {
  readCatalogUrl,
  writeCatalogUrl,
} from '@/features/storefront/utils/catalog-url';
import {
  CatalogFilterOption,
  catalogOptionGrid,
} from '@/features/storefront/components/catalog-filter-option';
import { memo, useEffect, useState, type SubmitEvent } from 'react';
import { SmartSearch } from '@/features/ai/components/smart-search';
import './catalog-filters.css';
import {
  Filter,
  RotateCcw,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ListPagination } from '@/components/list-pagination';
import { usePublicBrands } from '@/features/brands/hooks/use-public-brands';
import type { PublicBrand } from '@/features/brands/types/brands';
import { usePublicCategories } from '@/features/categories/hooks/use-public-categories';
import type { PublicCategory } from '@/features/categories/types/categories';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductCard } from '@/features/storefront/components/product-card';
import { useStoreFilterCount } from '@/features/storefront/hooks/use-store-filter-count';
import type { Product } from '@/features/products/types/products';
import type { ProductsQuery } from '@/features/products/types/products';
import { useStoreProducts } from '@/features/storefront/hooks/use-store-products';
import { mapCatalogProduct } from '@/features/storefront/utils/map-catalog-product';
import { catalogBadgeFilter } from '@/features/storefront/utils/catalog-badge-filter';
import { getApiError } from '@/services/api';
import { CatalogSubcategories } from '@/features/storefront/components/catalog-subcategories';

const CatalogProductGrid = memo(function CatalogProductGrid({
  products,
}: {
  products: Product[];
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={mapCatalogProduct(product)} />
      ))}
    </div>
  );
});

function FilterOptionsLoading({ label }: { label: string }) {
  return (
    <div role="status" className={catalogOptionGrid}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: 12 }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="h-16 rounded-xl bg-gray-100 motion-safe:animate-pulse"
        />
      ))}
    </div>
  );
}

interface FilterDraft {
  brand: string;
  category: string;
  minPrice: string;
  maxPrice: string;
}

const PRICE_RANGES = [
  { label: 'Dưới 2 triệu', min: '', max: '2000000' },
  { label: 'Từ 2 - 4 triệu', min: '2000000', max: '4000000' },
  { label: 'Từ 4 - 7 triệu', min: '4000000', max: '7000000' },
  { label: 'Từ 7 - 13 triệu', min: '7000000', max: '13000000' },
  { label: 'Từ 13 - 20 triệu', min: '13000000', max: '20000000' },
  { label: 'Trên 20 triệu', min: '20000000', max: '' },
] as const;

function selectionIds(value: string): string[] {
  return [...new Set(value.split(',').filter(Boolean))];
}

function toggleSelection(value: string, id: string): string {
  const ids = selectionIds(value);
  return (
    ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
  ).join(',');
}

function resolveCategories(
  value: string,
  categories: PublicCategory[]
): string | undefined {
  const ids = selectionIds(value).map((id) =>
    /^[a-f\d]{24}$/i.test(id)
      ? id
      : categories.find((item) => item.slug === id || item.name === id)?._id
  );
  return ids.length && ids.every(Boolean)
    ? [...new Set(ids)].join(',')
    : undefined;
}

function childSelections(
  value: string,
  parentIds: string | undefined,
  categories: PublicCategory[]
) {
  const parents = selectionIds(parentIds ?? '');
  const selected = new Map<string, PublicCategory>();
  for (const id of selectionIds(value)) {
    const child = categories.find((category) => category._id === id);
    if (
      child?.parent &&
      parents.includes(child.parent) &&
      !selected.has(child.parent)
    )
      selected.set(child.parent, child);
  }
  return [...selected.values()];
}

function effectiveCategories(
  parentIds: string | undefined,
  children: PublicCategory[]
) {
  return parentIds
    ? [
        ...new Set(
          selectionIds(parentIds).map(
            (id) => children.find((child) => child.parent === id)?._id ?? id
          )
        ),
      ].join(',')
    : undefined;
}

function retainSubcategories(
  params: URLSearchParams,
  parentIds: string | undefined,
  categories: PublicCategory[]
) {
  const ids = childSelections(
    params.get('subcategory') ?? '',
    parentIds,
    categories
  ).map((child) => child._id);
  if (ids.length) params.set('subcategory', ids.join(','));
  else params.delete('subcategory');
}

function filterDraftFromParams(params: URLSearchParams): FilterDraft {
  return {
    brand: params.get('brand') ?? '',
    category: params.get('category') ?? '',
    minPrice: params.get('minPrice') ?? '',
    maxPrice: params.get('maxPrice') ?? '',
  };
}

function FilterChoice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-w-0 shrink-0 rounded-xl border text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d9210] ${
        selected
          ? 'border-[#4d9210] bg-[#e9f5e0] text-[#397a16] ring-1 ring-[#4d9210]'
          : 'border-gray-200 bg-white text-gray-700 hover:border-[#9acb74]'
      }`}
    >
      {children}
    </button>
  );
}

type SelectedFilterKey = 'brand' | 'category' | 'price';
interface SelectedFilter {
  key: SelectedFilterKey;
  value?: string;
  label: string;
}

function SelectedFilters({
  items,
  onRemove,
  onClear,
}: {
  items: SelectedFilter[];
  onRemove: (key: SelectedFilterKey, value?: string) => void;
  onClear: () => void;
}) {
  return (
    <div
      className="flex min-w-0 flex-wrap items-center gap-2.5"
      aria-label="Các bộ lọc đã chọn"
    >
      <span className="text-sm font-semibold text-gray-800">Đã chọn:</span>
      {items.length ? (
        <>
          {items.map((item) => (
            <button
              key={`${item.key}:${item.value ?? ''}`}
              type="button"
              aria-label={`Bỏ ${item.label}`}
              onClick={() => onRemove(item.key, item.value)}
              className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-xl bg-[#e9f5e0] px-3 py-2 text-sm font-medium text-[#397a16] transition hover:bg-[#dcedcc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d9210]"
            >
              <span className="break-words">{item.label}</span>
              <X size={15} aria-hidden="true" className="shrink-0" />
            </button>
          ))}
          <button
            type="button"
            onClick={onClear}
            className="min-h-10 rounded-md px-2 text-sm font-semibold text-[#4d9210] hover:underline focus-visible:outline-2 focus-visible:outline-[#4d9210]"
          >
            Xóa tất cả
          </button>
        </>
      ) : (
        <span className="text-sm text-gray-500">Chưa chọn bộ lọc</span>
      )}
    </div>
  );
}

function selectedFilters(
  values: FilterDraft,
  brands: PublicBrand[],
  categories: PublicCategory[]
): SelectedFilter[] {
  const items: SelectedFilter[] = [];
  for (const id of selectionIds(values.brand))
    items.push({
      key: 'brand',
      value: id,
      label:
        brands.find((item) => item._id === id)?.name ?? 'Thương hiệu đã chọn',
    });
  if (values.minPrice || values.maxPrice) {
    const preset = PRICE_RANGES.find(
      (range) => range.min === values.minPrice && range.max === values.maxPrice
    );
    const money = (value: string) =>
      Number(value).toLocaleString('vi-VN') + ' ₫';
    items.push({
      key: 'price',
      label:
        preset?.label ??
        `${values.minPrice ? money(values.minPrice) : '0 ₫'} – ${values.maxPrice ? money(values.maxPrice) : 'Không giới hạn'}`,
    });
  }
  for (const id of selectionIds(values.category))
    items.push({
      key: 'category',
      value: id,
      label:
        categories.find(
          (item) => item._id === id || item.slug === id || item.name === id
        )?.name ?? 'Danh mục đã chọn',
    });
  return items;
}

function categoryLabel(category: PublicCategory): string {
  return category.name;
}

function parsePrice(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export default function StorefrontProductsPage() {
  const [urlParams, setUrlParams] = useSearchParams();
  const categories = usePublicCategories(true);
  const brands = usePublicBrands(true);
  const params = readCatalogUrl(
    urlParams,
    categories.data ?? [],
    brands.data ?? []
  );
  function slugParams(value: URLSearchParams) {
    return writeCatalogUrl(value, categories.data ?? [], brands.data ?? []);
  }
  function setParams(update: (previous: URLSearchParams) => URLSearchParams) {
    setUrlParams(slugParams(update(new URLSearchParams(params))));
  }
  const canonical = slugParams(params).toString();
  useEffect(() => {
    if (canonical !== urlParams.toString())
      setUrlParams(canonical, { replace: true });
  }, [canonical, urlParams, setUrlParams]);
  const requested = Number(params.get('page'));
  const page = Number.isSafeInteger(requested) && requested > 0 ? requested : 1;
  const search = params.get('search') ?? '';
  const sort = params.get('sort') ?? 'all';
  const brand = params.get('brand') ?? '';
  const category = params.get('category') ?? '';
  const minPriceParam = params.get('minPrice') ?? '';
  const maxPriceParam = params.get('maxPrice') ?? '';
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterError, setFilterError] = useState('');
  const [draftState, setDraftState] = useState<{
    key: string;
    value: FilterDraft;
  } | null>(null);
  const filterKey = [brand, category, minPriceParam, maxPriceParam].join('|');
  const draft =
    draftState?.key === filterKey
      ? draftState.value
      : filterDraftFromParams(params);
  const filterBrands = brands.data ?? [];
  const categoryId = resolveCategories(category, categories.data ?? []);
  const emptyCategory = '000000000000000000000000';
  const hasCategoryFilter = !!category || !!urlParams.get('c');
  const safeBrand = (value: string) =>
    value && selectionIds(value).every((id) => /^[a-f\d]{24}$/i.test(id))
      ? value
      : value
        ? emptyCategory
        : undefined;
  const subcategory = params.get('subcategory') ?? '';
  const selectedChildren = childSelections(
    subcategory,
    categoryId,
    categories.data ?? []
  );
  const query = useStoreProducts({
    ...catalogBadgeFilter(sort),
    page,
    limit: 12,
    search: search || undefined,
    brand: safeBrand(brand),
    category:
      effectiveCategories(categoryId, selectedChildren) ??
      (hasCategoryFilter ? emptyCategory : undefined),
    minPrice: parsePrice(minPriceParam),
    maxPrice: parsePrice(maxPriceParam),
    sortBy: sort.startsWith('price')
      ? 'price'
      : sort === 'name'
        ? 'product_name'
        : sort === 'featured'
          ? 'is_hot'
          : sort === 'bestsellers'
            ? 'is_best_seller'
            : sort === 'discount'
              ? 'discount'
              : 'createdAt',
    sortOrder: sort === 'price-asc' || sort === 'name' ? 'asc' : 'desc',
  });

  function updateSort(value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value) next.set('sort', value);
      else next.delete('sort');
      next.delete('page');
      return next;
    });
  }

  function updateDraft(patch: Partial<FilterDraft>) {
    setDraftState({ key: filterKey, value: { ...draft, ...patch } });
  }

  function applyFilters(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!previewReady || !preview.data || preview.data <= 0) return;
    const minPrice = parsePrice(draft.minPrice);
    const maxPrice = parsePrice(draft.maxPrice);
    if (
      (draft.minPrice && minPrice === undefined) ||
      (draft.maxPrice && maxPrice === undefined)
    ) {
      setFilterError('Vui lòng nhập khoảng giá hợp lệ.');
      return;
    }
    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      setFilterError('Giá tối thiểu không thể lớn hơn giá tối đa.');
      return;
    }

    setParams((previous) => {
      const next = new URLSearchParams(previous);
      for (const key of ['brand', 'category', 'minPrice', 'maxPrice'])
        next.delete(key);
      if (draft.brand) next.set('brand', draft.brand);
      if (draftCategoryId) next.set('category', draftCategoryId);
      retainSubcategories(next, draftCategoryId, categories.data ?? []);
      if (draft.minPrice.trim()) next.set('minPrice', String(minPrice));
      if (draft.maxPrice.trim()) next.set('maxPrice', String(maxPrice));
      next.delete('page');
      return next;
    });
    setFilterError('');
    setFiltersOpen(false);
  }

  function clearFilters() {
    setDraftState({
      key: filterKey,
      value: { brand: '', category: '', minPrice: '', maxPrice: '' },
    });
    setFilterError('');
  }

  const draftCategoryId = resolveCategories(
    draft.category,
    categories.data ?? []
  );
  const draftMin = parsePrice(draft.minPrice);
  const draftMax = parsePrice(draft.maxPrice);
  const validDraft =
    (!draft.minPrice || draftMin !== undefined) &&
    (!draft.maxPrice || draftMax !== undefined) &&
    (draftMin === undefined ||
      draftMax === undefined ||
      draftMin <= draftMax) &&
    (!draft.category || !!draftCategoryId);
  const previewParams: Partial<ProductsQuery> = {
    ...catalogBadgeFilter(sort),
    search: search || undefined,
    brand: safeBrand(draft.brand),
    category: effectiveCategories(
      draftCategoryId,
      childSelections(subcategory, draftCategoryId, categories.data ?? [])
    ),
    minPrice: draftMin,
    maxPrice: draftMax,
  };
  const preview = useStoreFilterCount(previewParams, filtersOpen && validDraft);
  const previewReady =
    !categories.isPending &&
    !categories.isError &&
    !brands.isPending &&
    !brands.isError &&
    validDraft &&
    preview.data !== undefined &&
    !preview.isFetching &&
    !preview.isError;
  const appliedSelections = selectedFilters(
    filterDraftFromParams(params),
    filterBrands,
    categories.data ?? []
  );
  const draftSelections = selectedFilters(
    draft,
    filterBrands,
    categories.data ?? []
  );
  function removeDraftFilter(key: SelectedFilterKey, value?: string) {
    updateDraft(
      key === 'price'
        ? { minPrice: '', maxPrice: '' }
        : {
            [key]: selectionIds(draft[key])
              .filter((id) => id !== value)
              .join(','),
          }
    );
    setFilterError('');
  }
  function removeAppliedFilter(key?: SelectedFilterKey, value?: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      const fields =
        key === undefined
          ? ['brand', 'category', 'minPrice', 'maxPrice']
          : key === 'price'
            ? ['minPrice', 'maxPrice']
            : [key];
      if ((key === 'brand' || key === 'category') && value) {
        const remaining = selectionIds(previous.get(key) ?? '')
          .filter((id) => id !== value)
          .join(',');
        if (remaining) next.set(key, remaining);
        else next.delete(key);
      } else fields.forEach((field) => next.delete(field));
      retainSubcategories(
        next,
        resolveCategories(next.get('category') ?? '', categories.data ?? []),
        categories.data ?? []
      );
      next.delete('page');
      return next;
    });
  }
  const selectedCategoryInvalid = Boolean(
    category && !categoryId && categories.data
  );

  return (
    <div className="store-catalog min-h-[60vh] bg-white text-gray-950">
      <div className="store-container space-y-6 py-8">
        <SmartSearch />
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
          <Link className="transition-colors hover:text-[#4d9210]" to="/">
            Trang chủ
          </Link>{' '}
          / Khám phá sản phẩm
        </nav>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
            Khám phá sản phẩm
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Chọn phụ kiện phù hợp từ danh sách sản phẩm của cửa hàng.
          </p>
        </div>

        <section aria-label="Lọc và sắp xếp sản phẩm" className="py-1">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <Dialog
              open={filtersOpen}
              onOpenChange={(open) => {
                if (open) {
                  setDraftState(null);
                  setFilterError('');
                }
                setFiltersOpen(open);
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (!filtersOpen) {
                    setDraftState(null);
                    setFilterError('');
                  }
                  setFiltersOpen((open) => !open);
                }}
                aria-expanded={filtersOpen}
                className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition ${
                  filtersOpen
                    ? 'border-[#55b000] bg-[#f2f8ec] text-[#3e8011]'
                    : 'border-gray-200 bg-white text-gray-800 hover:border-[#55b000]'
                }`}
              >
                {filtersOpen ? <X size={17} /> : <Filter size={17} />}
                Lọc
              </button>

              <DialogContent
                overlayClassName="store-filter-overlay"
                showCloseButton={false}
                className="store-filter-dialog flex h-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-4xl flex-col gap-0 overflow-hidden rounded-3xl border border-gray-100 bg-white p-0 text-gray-900 shadow-2xl sm:max-w-4xl"
              >
                <DialogHeader className="relative flex min-h-20 shrink-0 flex-row items-center justify-between border-b border-gray-100 bg-[#f4f5f2] px-5 py-5 sm:px-8">
                  <DialogTitle className="pr-24 text-xl font-bold tracking-tight text-gray-950">
                    Tất cả bộ lọc
                  </DialogTitle>
                  <DialogClose
                    aria-label="Đóng bộ lọc"
                    className="absolute top-1/2 right-4 inline-flex h-10 -translate-y-1/2 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <X size={16} /> Đóng
                  </DialogClose>
                </DialogHeader>

                <form onSubmit={applyFilters} className="flex min-h-0 flex-col">
                  <div className="min-h-0 space-y-6 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8">
                    <SelectedFilters
                      items={draftSelections}
                      onRemove={removeDraftFilter}
                      onClear={clearFilters}
                    />
                    <section aria-labelledby="filter-brands-heading">
                      <h3
                        id="filter-brands-heading"
                        className="mb-3 text-sm font-semibold tracking-[0.12em] text-gray-700 uppercase"
                      >
                        Thương hiệu
                      </h3>
                      {brands.isPending ? (
                        <FilterOptionsLoading label="Đang tải thương hiệu…" />
                      ) : brands.isError ? (
                        <div role="alert" className="py-3 text-sm text-red-700">
                          Không thể tải thương hiệu.{' '}
                          <button
                            type="button"
                            onClick={() => void brands.refetch()}
                            className="font-semibold underline"
                          >
                            Thử lại
                          </button>
                        </div>
                      ) : filterBrands.length ? (
                        <div className={catalogOptionGrid}>
                          {filterBrands.map((item) => (
                            <CatalogFilterOption
                              key={item._id}
                              name={item.name}
                              image={item.logoUrl}
                              selected={selectionIds(draft.brand).includes(
                                item._id
                              )}
                              onClick={() =>
                                updateDraft({
                                  brand: toggleSelection(draft.brand, item._id),
                                })
                              }
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Chưa có thương hiệu đang hoạt động.
                        </p>
                      )}
                    </section>

                    <section aria-labelledby="filter-price-heading">
                      <h3
                        id="filter-price-heading"
                        className="mb-3 text-sm font-semibold tracking-[0.12em] text-gray-700 uppercase"
                      >
                        Khoảng giá
                      </h3>
                      <div className="flex flex-wrap gap-2.5">
                        {PRICE_RANGES.map((range) => {
                          const selected =
                            draft.minPrice === range.min &&
                            draft.maxPrice === range.max;
                          return (
                            <FilterChoice
                              key={range.label}
                              selected={selected}
                              onClick={() =>
                                updateDraft(
                                  selected
                                    ? { minPrice: '', maxPrice: '' }
                                    : {
                                        minPrice: range.min,
                                        maxPrice: range.max,
                                      }
                                )
                              }
                            >
                              <span className="inline-flex min-h-11 items-center px-4">
                                {range.label}
                              </span>
                            </FilterChoice>
                          );
                        })}
                      </div>
                    </section>

                    <section aria-labelledby="filter-categories-heading">
                      <h3
                        id="filter-categories-heading"
                        className="mb-3 text-sm font-semibold tracking-[0.12em] text-gray-700 uppercase"
                      >
                        Danh mục sản phẩm
                      </h3>
                      {categories.isPending ? (
                        <FilterOptionsLoading label="Đang tải danh mục…" />
                      ) : categories.isError ? (
                        <div role="alert" className="py-3 text-sm text-red-700">
                          Không thể tải danh mục.{' '}
                          <button
                            type="button"
                            onClick={() => void categories.refetch()}
                            className="font-semibold underline"
                          >
                            Thử lại
                          </button>
                        </div>
                      ) : (
                        <div className={catalogOptionGrid}>
                          <CatalogFilterOption
                            name="Tất cả danh mục"
                            all
                            selected={!draft.category}
                            onClick={() => updateDraft({ category: '' })}
                          />

                          {categories.data
                            ?.filter((item) => !item.parent)
                            .map((item) => (
                              <CatalogFilterOption
                                key={item._id}
                                name={categoryLabel(item)}
                                image={item.icon}
                                selected={selectionIds(draft.category).includes(
                                  item._id
                                )}
                                onClick={() =>
                                  updateDraft({
                                    category: toggleSelection(
                                      draft.category,
                                      item._id
                                    ),
                                  })
                                }
                              />
                            ))}
                        </div>
                      )}
                    </section>
                    {preview.isError && (
                      <p role="alert" className="text-sm text-red-700">
                        Không thể đếm kết quả.{' '}
                        <button
                          type="button"
                          onClick={() => void preview.refetch()}
                          className="underline"
                        >
                          Thử lại
                        </button>
                      </p>
                    )}
                    {!validDraft && (
                      <p role="alert" className="text-sm text-red-700">
                        Bộ lọc chưa hợp lệ. Hãy chọn lại khoảng giá/danh mục
                        hoặc bấm Bỏ chọn.
                      </p>
                    )}
                    {filterError && (
                      <p role="alert" className="text-sm text-red-700">
                        {filterError}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-100 bg-[#f4f5f2] px-5 py-4 sm:flex-row sm:justify-between sm:px-8">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <RotateCcw size={15} /> Bỏ chọn
                    </button>
                    <button
                      type="submit"
                      disabled={
                        !previewReady || !preview.data || preview.data <= 0
                      }
                      aria-busy={!previewReady && !preview.isError}
                      className="inline-flex min-h-11 min-w-56 items-center justify-center rounded-xl bg-[#4d9210] px-8 text-sm font-semibold text-white transition hover:bg-[#3f7c0c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d9210] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {previewReady
                        ? `Xem ${preview.data} kết quả`
                        : 'Đang tải kết quả…'}
                    </button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            {appliedSelections.length > 0 && (
              <SelectedFilters
                items={appliedSelections}
                onRemove={removeAppliedFilter}
                onClear={() => removeAppliedFilter()}
              />
            )}
          </div>
        </section>

        <CatalogSubcategories
          categories={categories.data ?? []}
          selectedIds={selectionIds(categoryId ?? '')}
          selectedChildIds={selectedChildren.map((child) => child._id)}
          onChange={(ids) =>
            setParams((previous) => {
              const next = new URLSearchParams(previous);
              if (ids.length) next.set('subcategory', ids.join(','));
              else next.delete('subcategory');
              next.delete('page');
              return next;
            })
          }
        />

        <nav
          aria-label="Sắp xếp sản phẩm"
          className="flex flex-wrap items-center gap-x-4 gap-y-3 py-2 text-sm sm:text-base"
        >
          <span className="text-gray-600">Sắp xếp theo:</span>
          {(
            [
              ['all', 'Tất cả'],
              ['featured', 'Nổi bật'],
              ['newest', 'Mới'],
              ['bestsellers', 'Bán chạy'],
              ['discount', '% giảm giá'],
              ['price', 'Giá'],
            ] as const
          ).map(([value, label], index) => {
            const selected =
              value === 'price' ? sort.startsWith('price') : sort === value;
            return (
              <span key={value} className="inline-flex items-center gap-4">
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-gray-200"
                  />
                )}
                <button
                  type="button"
                  aria-pressed={selected}
                  aria-label={
                    value === 'price'
                      ? `Giá ${sort === 'price-asc' ? 'tăng dần' : sort === 'price-desc' ? 'giảm dần' : 'tăng hoặc giảm'}`
                      : label
                  }
                  onClick={() =>
                    updateSort(
                      value === 'price'
                        ? sort === 'price-asc'
                          ? 'price-desc'
                          : 'price-asc'
                        : value
                    )
                  }
                  className={`inline-flex min-h-11 items-center gap-1 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d9210] ${selected ? 'font-semibold text-[#4d9210]' : 'text-gray-500 hover:text-[#4d9210]'}`}
                >
                  {label}
                  {value === 'price' &&
                    (sort === 'price-asc' ? (
                      <ArrowUp size={14} />
                    ) : sort === 'price-desc' ? (
                      <ArrowDown size={14} />
                    ) : (
                      <ArrowUpDown size={14} />
                    ))}
                </button>
              </span>
            );
          })}
        </nav>

        {query.isPending ? (
          <LoadingSkeleton label="Đang tải sản phẩm…" variant="products" />
        ) : query.isError ? (
          <div role="alert" className="py-12 text-center">
            <p>{getApiError(query.error).message}</p>
            <button
              type="button"
              onClick={() => void query.refetch()}
              className="mt-3 font-semibold text-[#438e00]"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <>
            {selectedCategoryInvalid ? (
              <p role="alert">
                Danh mục không khả dụng. Vui lòng chọn danh mục khác.
              </p>
            ) : query.data.data.length ? (
              <CatalogProductGrid products={query.data.data} />
            ) : (
              <p className="py-12 text-center text-gray-500">
                Không tìm thấy sản phẩm phù hợp với bộ lọc.
              </p>
            )}
            <ListPagination
              label="Phân trang sản phẩm"
              page={page}
              totalPages={Math.max(1, query.data.pagination.totalPages)}
              disabled={query.isFetching}
              onPageChange={(nextPage) =>
                setParams((previous) => {
                  const updated = new URLSearchParams(previous);
                  updated.set('page', String(nextPage));
                  return updated;
                })
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
