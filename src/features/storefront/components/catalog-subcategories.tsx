import type { PublicCategory } from "@/features/categories/types/categories"

export function CatalogSubcategories({ categories, selectedIds, selectedChildIds, onChange }: {
  categories: PublicCategory[]
  selectedIds: string[]
  selectedChildIds: string[]
  onChange: (ids: string[]) => void
}) {
  const parents = categories.filter(parent => selectedIds.includes(parent._id) && categories.some(child => child.parent === parent._id))
  if (!parents.length) return null

  function select(parentId: string, categoryId: string) {
    const remaining = selectedChildIds.filter(id => categories.find(category => category._id === id)?.parent !== parentId)
    onChange(selectedChildIds.includes(categoryId) ? remaining : [...remaining, categoryId])
  }

  return <section aria-label="Chọn danh mục con" className="space-y-3">
    {parents.map(parent => <nav key={parent._id} aria-label={`Danh mục con của ${parent.name}`} className="flex flex-wrap items-center gap-2.5">
      {categories.filter(child => child.parent === parent._id).map(category => {
        const selected = selectedChildIds.includes(category._id)
        return <button key={category._id} type="button" aria-pressed={selected} onClick={() => select(parent._id, category._id)}
          className={`min-h-10 rounded-xl border px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d9210] ${selected ? "border-[#4d9210] bg-[#e9f5e0] font-semibold text-[#397a16]" : "border-gray-200 bg-white text-gray-700 hover:border-[#9acb74] hover:text-[#397a16]"}`}>
          {category.name}
        </button>
      })}
    </nav>)}
  </section>
}
