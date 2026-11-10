import { expect, it } from 'vitest';
import {
  readCatalogUrl,
  writeCatalogUrl,
} from '@/features/storefront/utils/catalog-url';
const categories = [
  { _id: 'parent', name: 'Chargers', slug: 'chargers' },
  { _id: 'child', name: 'USB C', slug: 'usb-c', parent: 'parent' },
  { _id: 'other', name: 'Other', slug: 'other' },
];
const brands = [{ _id: 'brand', name: 'Hoco', slug: 'hoco' }];
it('compacts legacy filters without losing API state or unrelated parameters', () => {
  const original = new URLSearchParams(
    'category=parent,other&subcategory=child&brand=brand&minPrice=7000000&maxPrice=13000000&sort=price-desc&page=2&search=cable&utm_source=test'
  );
  const compact = writeCatalogUrl(original, categories, brands);
  expect(compact.get('c')).toBe('usb-c,other');
  expect(compact.get('p')).toBe('7-13tr');
  expect(compact.get('b')).toBe('hoco');
  expect(compact.get('s')).toBe('pd');
  expect(compact.has('subcategory')).toBe(false);
  const restored = readCatalogUrl(compact, categories, brands);
  expect([...restored.entries()].sort()).toEqual(
    [...original.entries()].sort()
  );
  expect(writeCatalogUrl(restored, categories, brands).toString()).toBe(
    compact.toString()
  );
});
it('omits defaults and preserves exact custom prices', () => {
  const compact = writeCatalogUrl(
    new URLSearchParams('sort=all&page=1&minPrice=123456&maxPrice=999999'),
    [],
    []
  );
  expect(compact.has('s')).toBe(false);
  expect(compact.has('n')).toBe(false);
  expect(readCatalogUrl(compact, [], []).get('minPrice')).toBe('123456');
});
it('round trips open price ranges', () => {
  for (const price of ['minPrice=2000000', 'maxPrice=4000000']) {
    const original = new URLSearchParams(price);
    const compact = writeCatalogUrl(original, [], []);
    expect([...readCatalogUrl(compact, [], []).entries()]).toEqual([
      ...original.entries(),
    ]);
  }
});
