import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { BaseLayout } from '@/layout/admin/base-layout';
import { useProduct } from '@/features/products/hooks/use-product';
import { InventoryEditor } from '@/features/products/components/inventory-editor';
import { ProductQueryState } from '@/features/products/components/product-query-state';

export default function ProductInventoryPage() {
  const { id = '' } = useParams();
  const query = useProduct(id, true);
  const location = useLocation();
  if (query.data?.slug && id !== query.data.slug) {
    return <Navigate replace to={`/auth/products/${query.data.slug}/inventory${location.search}`} state={location.state} />;
  }
  return (
    <BaseLayout title="Cập nhật tồn kho">
      <div className="space-y-4 px-4 lg:px-6">
        <Link
          className="underline"
          to={`/auth/products/${query.data?.slug || id}`}
        >
          Về chi tiết sản phẩm
        </Link>
        {query.data ? (
          <InventoryEditor key={id} product={query.data} />
        ) : (
          <ProductQueryState
            invalid={!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(id) || id.length > 255}
            error={query.error}
            retry={query.refetch}
          />
        )}
      </div>
    </BaseLayout>
  );
}
