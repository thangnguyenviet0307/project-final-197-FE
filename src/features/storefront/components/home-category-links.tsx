import { Link } from 'react-router-dom';
import { CatalogOptionContent } from '@/features/storefront/components/catalog-filter-option';
import { usePublicCategories } from '@/features/categories/hooks/use-public-categories';

export function HomeCategoryLinks() {
  const query = usePublicCategories(true);
  return (
    <nav aria-label="Danh mục nhanh" className="store-container pt-5">
      {query.isPending ? (
        <p role="status">Đang tải danh mục…</p>
      ) : query.isError ? (
        <p>
          Không thể tải danh mục. <Link to="/shop">Xem sản phẩm</Link>
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {query.data
            ?.filter((category) => !category.parent)
            .slice(0, 12)
            .map((category) => (
              <Link
                key={category._id}
                to={`/shop?category=${category._id}`}
                className="flex h-16 min-w-0 items-center rounded-xl border border-gray-200 bg-white px-3 text-gray-800 hover:border-[#9acb74]"
              >
                <CatalogOptionContent name={category.name} image={category.icon} />
              </Link>
            ))}
        </div>
      )}
    </nav>
  );
}
