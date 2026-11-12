import { expect, it } from 'vitest';
import { catalogBadgeFilter } from '@/features/storefront/utils/catalog-badge-filter';
import { mapCatalogProduct } from '@/features/storefront/utils/map-catalog-product';

it('filters by the visible badge for all combinations of legacy flags', () => {
  for (let mask = 0; mask < 8; mask++) {
    const product = {
      _id: 'product',
      product_name: 'Product',
      category: null,
      brand: null,
      is_best_seller: !!(mask & 1),
      is_new: !!(mask & 2),
      is_hot: !!(mask & 4),
    };
    for (const [tab, label] of [
      ['bestsellers', 'Bán chạy'],
      ['newest', 'Mới'],
      ['featured', 'Nổi bật'],
    ]) {
      const matches = Object.entries(catalogBadgeFilter(tab)).every(
        ([field, value]) => product[field as 'is_new'] === value
      );
      expect(matches).toBe(
        mapCatalogProduct(product).badges?.[0]?.label === label
      );
    }
  }
  for (const tab of ['all', 'price-asc', 'price-desc', 'discount'])
    expect(catalogBadgeFilter(tab)).toEqual({});
});
