import type { ProductsQuery } from '@/features/products/types/products';

// Match the single visible badge, including legacy products with multiple flags.
export function catalogBadgeFilter(sort: string): Partial<ProductsQuery> {
  if (sort === 'bestsellers') return { is_best_seller: true };
  if (sort === 'newest') return { is_best_seller: false, is_new: true };
  if (sort === 'featured')
    return { is_best_seller: false, is_new: false, is_hot: true };
  return {};
}
