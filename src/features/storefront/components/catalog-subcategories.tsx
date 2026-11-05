import { CatalogFilterOption, catalogOptionGrid } from './catalog-filter-option';
import type { PublicCategory } from '@/features/categories/types/categories';

export function CatalogSubcategories({
  categories,
  selectedIds,
  selectedChildIds,
  onChange,
}: {
  categories: PublicCategory[];
  selectedIds: string[];
  selectedChildIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const parents = categories.filter(
    (parent) =>
      selectedIds.includes(parent._id) &&
      categories.some((child) => child.parent === parent._id)
  );
  if (!parents.length) return null;

  function select(parentId: string, categoryId: string) {
    const remaining = selectedChildIds.filter(
      (id) =>
        categories.find((category) => category._id === id)?.parent !== parentId
    );
    onChange(
      selectedChildIds.includes(categoryId)
        ? remaining
        : [...remaining, categoryId]
    );
  }

  return (
    <section aria-label="Chọn danh mục con" className="space-y-3">
      {parents.map((parent) => (
        <nav
          key={parent._id}
          aria-label={`Danh mục con của ${parent.name}`}
          className={catalogOptionGrid}
        >
          {categories
            .filter((child) => child.parent === parent._id)
            .map((category) => {
              const selected = selectedChildIds.includes(category._id);
              return (
                <CatalogFilterOption
                  key={category._id}
                  name={category.name}
                  image={category.icon}
                  selected={selected}
                  onClick={() => select(parent._id, category._id)}
                />
              );
            })}
        </nav>
      ))}
    </section>
  );
}
