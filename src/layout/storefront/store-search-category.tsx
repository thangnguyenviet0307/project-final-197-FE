
import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { storefrontCategories } from "@/features/storefront/data/products"

type StoreSearchCategoryProps = {
  value: string
  onChange: (value: string) => void
}

export function StoreSearchCategory({
  value,
  onChange,
}: StoreSearchCategoryProps) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false)
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false)
        }
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="store-search-category-list"
        onClick={() => setOpen((previous) => !previous)}
        className="flex h-11 min-w-36 items-center justify-between gap-2 border-r border-gray-200 px-3 text-xs text-gray-700 hover:text-green-600"
      >
        <span className="max-w-32 truncate">{value || "Tất cả danh mục"}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          id="store-search-category-list"
          className="absolute left-0 top-full z-50 mt-1 max-h-64 w-48 overflow-y-auto rounded-md border border-gray-200 bg-white py-2 shadow-xl"
        >
          {["", ...storefrontCategories.map((category) => category.name)].map(
            (category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  onChange(category)
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-gray-700 hover:bg-green-50 hover:text-green-700"
              >
                {category || "Tất cả danh mục"}
                {category === value && (
                  <Check size={14} className="text-green-600" />
                )}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}
