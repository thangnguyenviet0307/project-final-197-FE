import { Link } from "react-router-dom"
import { CatalogImage } from "@/components/catalog-image"
import { usePublicCategories } from "@/features/categories/hooks/use-public-categories"

export function HomeCategoryLinks() {
  const query = usePublicCategories(true)
  return <nav aria-label="Danh mục nhanh" className="mx-auto max-w-7xl px-4 pt-5">
    {query.isPending ? <p role="status">Đang tải danh mục…</p> : query.isError ? <p>Không thể tải danh mục. <Link to="/shop">Xem sản phẩm</Link></p> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {query.data?.filter(category => !category.parent).slice(0, 12).map(category => <Link key={category._id} to={`/shop?category=${category._id}`} className="flex items-center gap-3 rounded-lg border bg-white p-3">
        <CatalogImage src={category.icon} alt="" className="size-12" /><span className="text-sm font-semibold text-gray-800">{category.name}</span>
      </Link>)}
    </div>}
  </nav>
}
