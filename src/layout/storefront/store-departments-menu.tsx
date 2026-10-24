
import { useEffect, useId, useRef, useState } from "react"
import {
  ChevronRight,
  Menu,
  Phone,
  Printer,
  Monitor,
  Mic,
  Zap,
  Camera,
  Headphones,
  Smartphone,
  type LucideIcon,
} from "lucide-react"

type Department = {
  label: string
  icon: LucideIcon
  children?: string[]
}

const departments: Department[] = [
  {
    label: "New Arrivals",
    icon: Phone,
  },
  {
    label: "Top 100 Best Seller",
    icon: Printer,
  },
  {
    label: "TV & Video",
    icon: Monitor,
    children: [
      "Smart TV",
      "LED TV",
      "Projectors",
      "Streaming Devices",
    ],
  },
  {
    label: "Home Audio & Theater",
    icon: Mic,
    children: [
      "Home Theater",
      "Soundbars",
      "Speakers",
      "Amplifiers",
    ],
  },
  {
    label: "Cell Phones & Laptop",
    icon: Zap,
    children: [
      "Mobile Phones",
      "Laptops",
      "Laptop Accessories",
      "Chargers",
    ],
  },
  {
    label: "Camera, Photo & Video",
    icon: Camera,
    children: [
      "Digital Cameras",
      "Action Cameras",
      "Camera Lenses",
      "Tripods",
    ],
  },
  {
    label: "Headphones",
    icon: Headphones,
    children: [
      "Wireless Headphones",
      "Gaming Headsets",
      "Earbuds",
      "Bluetooth Headphones",
    ],
  },
  {
    label: "Smart Phone & Tablets",
    icon: Smartphone,
  },
  {
    label: "Fax Machine",
    icon: Printer,
  },
]

export function StoreDepartmentsMenu() {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
        setActiveIndex(null)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        setActiveIndex(null)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  const toggleMenu = () => {
    setOpen((previous) => !previous)
    setActiveIndex(null)
  }

  return (
    <div
      ref={containerRef}
      className="relative z-50 w-full lg:w-[280px] xl:w-[320px]"
    >
      <button
        type="button"
        onClick={toggleMenu}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex h-14 w-full items-center justify-between rounded-t-lg bg-black px-5 text-white transition-colors hover:bg-[#171717]"
      >
        <span className="text-sm font-bold uppercase tracking-wider">
          ALL DEPARTMENTS
        </span>
        <Menu size={23} />
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute left-0 top-full z-50 w-full border border-gray-100 bg-white shadow-xl"
        >
          {departments.map((department, index) => {
            const Icon = department.icon
            const hasChildren = Boolean(department.children?.length)
            const expanded = activeIndex === index

            return (
              <div
                key={department.label}
                className="relative"
                onMouseEnter={() => {
                  if (window.matchMedia("(min-width: 1024px)").matches) {
                    setActiveIndex(hasChildren ? index : null)
                  }
                }}
                onMouseLeave={() => {
                  if (window.matchMedia("(min-width: 1024px)").matches) {
                    setActiveIndex(null)
                  }
                }}
              >
                <button
                  type="button"
                  aria-expanded={hasChildren ? expanded : undefined}
                  onClick={() => {
                    setActiveIndex(
                      hasChildren && !expanded ? index : null
                    )
                  }}
                  className={`flex min-h-[52px] w-full items-center gap-3 border-b border-gray-100 px-5 text-left text-sm transition-colors ${
                    expanded
                      ? "bg-[#f1f8e9] text-[#55b000]"
                      : "text-gray-600 hover:bg-[#f1f8e9] hover:text-[#55b000]"
                  }`}
                >
                  <Icon size={17} className="shrink-0" />

                  <span className="min-w-0 flex-1">
                    {department.label}
                  </span>

                  {hasChildren && (
                    <ChevronRight
                      size={16}
                      className={`shrink-0 transition-transform ${
                        expanded ? "rotate-90 lg:rotate-0" : ""
                      }`}
                    />
                  )}
                </button>

                {hasChildren && expanded && (
                  <>
                    <div className="hidden lg:absolute lg:left-full lg:top-0 lg:block lg:min-w-[245px] lg:border lg:border-gray-100 lg:bg-white lg:py-2 lg:shadow-xl">
                      <p className="border-b border-gray-100 px-5 py-3 text-sm font-bold text-gray-900">
                        {department.label}
                      </p>

                      {department.children?.map((child) => (
                        <button
                          key={child}
                          type="button"
                          className="block w-full px-5 py-3 text-left text-sm text-gray-600 hover:bg-[#f1f8e9] hover:text-[#55b000]"
                        >
                          {child}
                        </button>
                      ))}
                    </div>

                    <div className="bg-gray-50 py-2 lg:hidden">
                      {department.children?.map((child) => (
                        <button
                          key={child}
                          type="button"
                          className="block w-full px-10 py-3 text-left text-sm text-gray-600 hover:text-[#55b000]"
                        >
                          {child}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}

          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="flex min-h-[52px] w-full items-center justify-between bg-gray-100 px-5 text-left text-sm text-gray-700 transition-colors hover:bg-[#edf6e4] hover:text-[#55b000]"
          >
            <span>All Categories</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
