import type { PublicCategory } from '@/features/categories/types/categories';
import type { PublicBrand } from '@/features/brands/types/brands';

const aliases = { brand: 'b', sort: 's', search: 'q', page: 'n' } as const;
const sorts: Record<string, string> = {
  'price-asc': 'pa',
  'price-desc': 'pd',
  newest: 'new',
  bestsellers: 'best',
  featured: 'hot',
  discount: 'sale',
};
const tokens = (value: string | null) =>
  value?.split(',').filter(Boolean) ?? [];

export function readCatalogUrl(
  url: URLSearchParams,
  categories: PublicCategory[],
  brands: PublicBrand[]
) {
  const params = new URLSearchParams(url);
  for (const [key, alias] of Object.entries(aliases)) {
    if (params.has(alias)) {
      params.set(key, params.get(alias)!);
      params.delete(alias);
    }
  }
  if (params.has('sort'))
    params.set(
      'sort',
      Object.entries(sorts).find(
        ([, value]) => value === params.get('sort')
      )?.[0] ?? params.get('sort')!
    );
  const price = params.get('p');
  if (price && /^\d*-\d*tr$/.test(price)) {
    const [min, max] = price.slice(0, -2).split('-');
    if (min) params.set('minPrice', String(Number(min) * 1_000_000));
    if (max) params.set('maxPrice', String(Number(max) * 1_000_000));
    params.delete('p');
  }
  for (const key of ['category', 'subcategory', 'brand'] as const) {
    const options = key === 'brand' ? brands : categories;
    if (params.has(key))
      params.set(
        key,
        tokens(params.get(key))
          .map(
            (token) =>
              options.find((item) => item.slug === token || item.name === token)
                ?._id ?? token
          )
          .join(',')
      );
  }
  if (params.has('c') && categories.length) {
    const parents: string[] = [],
      children: string[] = [];
    for (const token of tokens(params.get('c'))) {
      const category = categories.find(
        (item) =>
          item.slug === token || item._id === token || item.name === token
      );
      parents.push(category?.parent || category?._id || token);
      if (category?.parent) children.push(category._id);
    }
    params.set('category', [...new Set(parents)].join(','));
    if (children.length) params.set('subcategory', children.join(','));
    params.delete('c');
  }
  return params;
}

export function writeCatalogUrl(
  value: URLSearchParams,
  categories: PublicCategory[],
  brands: PublicBrand[]
) {
  const next = new URLSearchParams(value);
  const parents = tokens(next.get('category'));
  const children = tokens(next.get('subcategory'));
  if (parents.length) {
    next.set(
      'c',
      parents
        .map((id) => {
          const child = categories.find(
            (item) => item.parent === id && children.includes(item._id)
          );
          return (
            child?.slug ??
            categories.find((item) => item._id === id)?.slug ??
            id
          );
        })
        .join(',')
    );
    next.delete('category');
    next.delete('subcategory');
  }
  if (next.has('brand'))
    next.set(
      'brand',
      tokens(next.get('brand'))
        .map((id) => brands.find((item) => item._id === id)?.slug ?? id)
        .join(',')
    );
  const min = next.get('minPrice'),
    max = next.get('maxPrice');
  if (
    (min || max) &&
    [min, max].every(
      (item) => !item || (/^\d+$/.test(item) && Number(item) % 1_000_000 === 0)
    )
  ) {
    next.set(
      'p',
      `${min ? Number(min) / 1_000_000 : ''}-${max ? Number(max) / 1_000_000 : ''}tr`
    );
    next.delete('minPrice');
    next.delete('maxPrice');
  }
  if (next.get('sort') === 'all') next.delete('sort');
  else if (next.has('sort'))
    next.set('sort', sorts[next.get('sort')!] ?? next.get('sort')!);
  if (next.get('page') === '1') next.delete('page');
  for (const [key, alias] of Object.entries(aliases)) {
    if (next.has(key)) {
      if (next.get(key)) next.set(alias, next.get(key)!);
      next.delete(key);
    }
  }
  next.sort();
  return next;
}
