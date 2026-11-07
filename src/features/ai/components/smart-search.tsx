import { useState } from 'react';
import { usePublicBrands } from '@/features/brands/hooks/use-public-brands';
import { usePublicCategories } from '@/features/categories/hooks/use-public-categories';
import { useAiSearch } from '../hooks/use-ai-products';
import { AiProducts } from './ai-products';
export function SmartSearch() {
  const [query, setQuery] = useState('');
  const [validation, setValidation] = useState('');
  const [params, setParams] = useState<
    Record<string, string | number | undefined>
  >({});
  const brands = usePublicBrands(true);
  const categories = usePublicCategories(true);
  const result = useAiSearch(params);
  return (
    <details className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
      <summary className="cursor-pointer font-semibold text-green-800">
        Tìm kiếm thông minh theo nhu cầu
      </summary>
      <form
        className="mt-3 flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const values = new FormData(event.currentTarget);
          const min = String(values.get('minPrice') || '');
          const max = String(values.get('maxPrice') || '');
          if (min && max && Number(min) > Number(max)) {
            setValidation('Giá tối thiểu không được lớn hơn giá tối đa.');
            return;
          }
          setValidation('');
          setParams({
            q: query.trim(),
            brand: String(values.get('brand') || '') || undefined,
            category: String(values.get('category') || '') || undefined,
            minPrice: min || undefined,
            maxPrice: max || undefined,
            page: 1,
            limit: 8,
          });
        }}
      >
        <input
          className="min-w-40 flex-1 rounded-lg border bg-white p-2"
          aria-label="Nhu cầu tìm sản phẩm"
          placeholder="Mô tả sản phẩm bạn cần…"
          maxLength={300}
          required
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="rounded-lg border bg-white p-2"
          aria-label="Thương hiệu"
          name="brand"
        >
          <option value="">Tất cả thương hiệu</option>
          {brands.data?.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border bg-white p-2"
          aria-label="Danh mục"
          name="category"
        >
          <option value="">Tất cả danh mục</option>
          {categories.data?.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          className="w-32 rounded-lg border bg-white p-2"
          type="number"
          name="minPrice"
          min="0"
          aria-label="Giá tối thiểu"
          placeholder="Giá từ"
        />
        <input
          className="w-32 rounded-lg border bg-white p-2"
          type="number"
          name="maxPrice"
          min="0"
          aria-label="Giá tối đa"
          placeholder="Giá đến"
        />
        <button
          className="rounded-lg bg-green-700 px-4 py-2 text-white"
          disabled={result.isFetching || !query.trim()}
        >
          Tìm sản phẩm
        </button>
      </form>
      {validation && <p role="alert">{validation}</p>}
      {result.isFetching && (
        <p className="mt-3" role="status">
          Đang tìm sản phẩm…
        </p>
      )}
      {result.isError && (
        <p className="mt-3" role="alert">
          Tìm kiếm thông minh chưa khả dụng. Bạn vẫn có thể dùng bộ lọc bên
          dưới. <button onClick={() => void result.refetch()}>Thử lại</button>
        </p>
      )}
      {result.data && (
        <div className="mt-4 space-y-3">
          <p className="text-sm">
            {result.data.semantic
              ? 'Kết quả kết hợp từ khóa và ngữ nghĩa'
              : 'Kết quả theo từ khóa'}
          </p>
          {!result.data.rows.length && <p>Chưa tìm thấy sản phẩm phù hợp.</p>}
          <AiProducts products={result.data.rows} />
          <div className="flex items-center gap-3">
            <button
              disabled={result.data.page <= 1 || result.isFetching}
              onClick={() =>
                setParams((p) => ({ ...p, page: Number(p['page']) - 1 }))
              }
            >
              Trước
            </button>
            <span>Trang {result.data.page}</span>
            <button
              disabled={
                result.data.page * result.data.limit >= result.data.total ||
                result.isFetching
              }
              onClick={() =>
                setParams((p) => ({ ...p, page: Number(p['page']) + 1 }))
              }
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </details>
  );
}
