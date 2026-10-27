import { useEffect, useId, useRef, useState } from "react"
import { ChevronRight, Menu } from "lucide-react"
import { Link } from "react-router-dom"
import { CatalogImage } from "@/components/catalog-image"
import { usePublicCategories } from "@/features/categories/hooks/use-public-categories"
import type { PublicCategory } from "@/features/categories/types/categories"
import "./store-departments-menu.css"

function CategoryBranch({
  category,
  categories,
  ancestors = [],
}: {
  category: PublicCategory
  categories: PublicCategory[]
  ancestors?: string[]
}) {
  const [expanded, setExpanded] = useState(false)
  const submenuId = useId()
  const isRoot = ancestors.length === 0
  const children = categories.filter(
    (item) => item.parent === category._id && !ancestors.includes(item._id),
  )

  const content = (
    <>
      <CatalogImage
        src={category.icon}
        alt={category.name}
        className="size-[18px] rounded-none border-0 bg-transparent text-[#666] [&>svg]:size-4"
      />
      <span className="min-w-0 flex-1 break-words">{category.name}</span>
    </>
  )

  return (
    <li
      className="border-b border-[#e8e8e8] last:border-0"
      onMouseEnter={() => {
        if (
          isRoot &&
          children.length &&
          window.matchMedia("(min-width: 1024px) and (hover: hover)").matches
        ) {
          setExpanded(true)
        }
      }}
      onMouseLeave={() => {
        if (
          isRoot &&
          window.matchMedia("(min-width: 1024px) and (hover: hover)").matches
        ) {
          setExpanded(false)
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false)
      }}
    >
      {children.length ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={submenuId}
          onClick={() => setExpanded((value) => !value)}
          className="flex min-h-[52px] w-full items-center gap-2.5 bg-white px-5 py-3 text-left text-base font-normal leading-6 text-[#666] transition-colors hover:bg-gray-50 hover:text-[#55b000] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#55b000]"
        >
          {content}
          <ChevronRight
            size={16}
            strokeWidth={1.5}
            className={`shrink-0 text-[#b5b5b5] transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        </button>
      ) : (
        <Link to={`/shop?category=${category._id}`} className="flex min-h-[52px] items-center gap-2.5 bg-white px-5 py-3 text-base font-normal leading-6 text-[#666]">
          {content}
        </Link>
      )}
      {expanded && children.length > 0 && (
        <ul
          id={submenuId}
          className={
            isRoot
              ? "store-category-submenu ml-5 border-l border-[#e8e8e8] bg-white lg:absolute lg:left-full lg:top-0 lg:ml-0 lg:grid lg:max-h-[70vh] lg:min-h-full lg:w-[min(600px,calc(100vw-360px))] lg:grid-cols-2 lg:content-start lg:overflow-y-auto lg:border lg:p-4 lg:shadow-xl"
              : "ml-5 border-l border-[#e8e8e8] bg-white"
          }
        >
          {children.map((child) => (
            <CategoryBranch
              key={child._id}
              category={child}
              categories={categories}
              ancestors={[...ancestors, category._id]}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export function StoreDepartmentsMenu() {
  const [open, setOpen] = useState(false)
  const { data: categories = [], isPending, isError, refetch, isFetching } =
    usePublicCategories(open)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const categoryIds = new Set(categories.map((category) => category._id))
  const roots = categories.filter(
    (category) => !category.parent || !categoryIds.has(category.parent),
  )

  useEffect(() => {
    const closeMenu = () => {
      setOpen(false)
    }
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeMenu()
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu()
    }

    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative z-50 w-full lg:w-[280px] xl:w-[320px]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex h-14 w-full items-center justify-between rounded-t-lg bg-black px-5 text-white transition-colors hover:bg-[#171717]"
      >
        <span className="text-sm font-bold uppercase tracking-wider">
          DANH MỤC SẢN PHẨM
        </span>
        <Menu size={23} />
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute left-0 top-full z-50 mt-7 max-h-[70vh] w-full overflow-y-auto bg-white shadow-[0_3px_18px_rgba(0,0,0,0.08)] lg:max-h-none lg:overflow-visible"
        >
          {isPending ? (
            <p role="status" className="px-5 py-4 text-sm text-gray-600">
              Đang tải danh mục…
            </p>
          ) : isError ? (
            <div role="alert" className="px-5 py-4 text-sm text-gray-700">
              <p>Không tải được danh mục. Vui lòng thử lại.</p>
              <button
                type="button"
                disabled={isFetching}
                onClick={() => void refetch()}
                className="mt-2 font-semibold text-[#459000] disabled:opacity-50"
              >
                Thử lại
              </button>
            </div>
          ) : roots.length ? (
            <ul>
              {roots.map((category) => (
                <CategoryBranch
                  key={category._id}
                  category={category}
                  categories={categories}
                />
              ))}
            </ul>
          ) : (
            <p className="px-5 py-4 text-sm text-gray-600">
              Chưa có danh mục sản phẩm.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
