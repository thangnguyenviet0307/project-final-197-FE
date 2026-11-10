import type { Category } from '@/features/categories/types/categories';

export function categoryParentName(
  category: Category,
  categories: Category[]
): string {
  if (!category.parent) return 'Danh mục gốc';
  if (typeof category.parent === 'object') return category.parent.name;
  return (
    categories.find((item) => item._id === category.parent)?.name ??
    'Danh mục cha không khả dụng'
  );
}
