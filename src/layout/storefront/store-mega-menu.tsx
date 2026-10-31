
import { useState } from "react"
import { Link } from "react-router-dom"
import { ChevronDown, ChevronRight } from "lucide-react"

type MenuColumn = {
  title: string
  items: string[]
}

const menuColumns: MenuColumn[] = [
  {
    title: "DANH MỤC",
    items: [
      "Điện thoại",
      "Laptop",
      "Máy tính bảng",
      "Đồng hồ thông minh",
      "Tai nghe",
    ],
  },
  {
    title: "SẢN PHẨM",
    items: [
      "Sản phẩm mới",
      "Sản phẩm nổi bật",
      "Sản phẩm bán chạy",
      "Phụ kiện",
      "Khuyến mãi",
    ],
  },
  {
    title: "KHÁM PHÁ",
    items: [
      "Thương hiệu",
      "Bộ sưu tập",
      "Chương trình ưu đãi",
      "Tin tức",
      "Liên hệ",
    ],
  },
]

export function StoreMegaMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="relative flex h-14 items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false)
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false)
        }
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="store-mega-menu"
        onClick={() => setOpen((previous) => !previous)}
        className="flex h-14 items-center gap-1.5 text-sm font-bold tracking-[0.05em] text-white transition-colors duration-200 hover:text-black focus-visible:outline-2 focus-visible:outline-white"
      >
        KHÁM PHÁ

        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        id="store-mega-menu"
        aria-hidden={!open}
        inert={!open}
        className={`absolute left-1/2 top-full z-50 w-[min(760px,calc(100vw-32px))] -translate-x-1/2 origin-top rounded-b-md border border-gray-200 bg-white p-6 text-gray-900 shadow-xl transition-[opacity,transform,visibility] duration-200 ${
          open
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
      >
        <div className="grid grid-cols-4 gap-6">
          {menuColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 border-b border-gray-200 pb-2 text-xs font-bold tracking-wider">
                {column.title}
              </h3>

              <div className="space-y-3">
                {column.items.map((item) => (
                  item === "Tin tức" ? (
                    <Link
                      key={item}
                      to="/bai-viet?type=news"
                      onClick={() => setOpen(false)}
                      className="group flex w-full items-center justify-between text-left text-sm text-gray-600 transition-colors hover:text-green-600"
                    >
                      {item}
                      <ChevronRight size={13} className="opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setOpen(false)}
                      className="group flex w-full items-center justify-between text-left text-sm text-gray-600 transition-colors hover:text-green-600"
                    >
                      {item}
                      <ChevronRight size={13} className="opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  )
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-col items-center justify-center rounded-lg bg-gray-100 p-4 text-center">
            <span className="mb-2 text-3xl">🎧</span>
            <p className="text-sm font-bold">
              PHỤ KIỆN CÔNG NGHỆ
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Khám phá bộ sưu tập mới
            </p>
            <span className="mt-4 rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white">
              XEM THÊM
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
