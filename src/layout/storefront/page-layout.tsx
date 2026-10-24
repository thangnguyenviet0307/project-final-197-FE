
import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"

interface BreadcrumbItem {
  label: string
  path?: string
}

interface PageLayoutProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  children: ReactNode
  className?: string
}

export function PageLayout({
  title,
  description,
  breadcrumbs = [],
  children,
  className = "",
}: PageLayoutProps) {
  return (
    <div className="min-h-[60vh] bg-white">
      {/* Page heading */}
      <header className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <li>
                <Link
                  to="/"
                  className="transition hover:text-[#55b000]"
                >
                  Trang chủ
                </Link>
              </li>

              {breadcrumbs.map((item, index) => (
                <li
                  key={`${item.label}-${index}`}
                  className="flex items-center gap-2"
                >
                  <ChevronRight size={15} />

                  {item.path ? (
                    <Link
                      to={item.path}
                      className="transition hover:text-[#55b000]"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">
            {title}
          </h1>

          {description && (
            <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600">
              {description}
            </p>
          )}
        </div>
      </header>

      {/* Content provided by other team members */}
      <div
        className={`mx-auto w-full max-w-7xl px-4 py-8 sm:py-12 ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
