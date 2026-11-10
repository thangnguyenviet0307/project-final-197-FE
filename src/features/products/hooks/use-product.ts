import { useQuery } from '@tanstack/react-query';
import {
  getProduct,
  getProductBySlug,
} from '@/features/products/services/products.service';
export function useProduct(id: string, allowSlug = false) {
  return useQuery({
    queryKey: ['products', 'detail', id],
    queryFn: ({ signal }) =>
      /^[a-f\d]{24}$/i.test(id)
        ? getProduct(id, signal)
        : getProductBySlug(id, signal),
    enabled:
      /^[a-f\d]{24}$/i.test(id) ||
      (allowSlug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) && id.length <= 255),
  });
}
