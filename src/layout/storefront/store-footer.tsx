
import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import {
  ArrowUp,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react"

import {
  Facebook,
  Instagram,
  Youtube,
} from "@/components/icons/brand-icons"

const companyLinks = [
  { label: "Giới thiệu", path: "/about" },
  { label: "Liên hệ", path: "/contact" },
  { label: "Chính sách bảo mật", path: "/policies/privacy" },
  { label: "Điều khoản sử dụng", path: "/policies/terms" },
]

const supportLinks = [
  { label: "Câu hỏi thường gặp", path: "/faq" },
  { label: "Chính sách giao hàng", path: "/policies/shipping" },
  { label: "Chính sách đổi trả", path: "/policies/returns" },
  { label: "Tài khoản của tôi", path: "/account/profile" },
]

export function StoreFooter() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim()) return

    setMessage("Tính năng đăng ký nhận tin đang được phát triển.")
  }

  function backToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="bg-[#111111] text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Store information */}
          <section>
            <Link
              to="/"
              className="text-3xl font-black tracking-tight text-white"
            >
              Phụ Kiện{" "}
              <span className="text-[#65b719]">Giá Xưởng</span>
            </Link>

            <p className="mt-5 text-sm leading-7 text-gray-400">
              Khám phá các nhóm phụ kiện công nghệ với hình ảnh sản phẩm và thông tin rõ ràng.
            </p>

            <div className="mt-5 space-y-3 text-sm">
              <p className="flex items-start gap-3">
                <MapPin className="mt-1 size-4 shrink-0 text-[#65b719]" />
                Việt Nam
              </p>

              <p className="flex items-center gap-3">
                <Phone className="size-4 text-[#65b719]" />
                Hỗ trợ khách hàng
              </p>

              <p className="flex items-center gap-3">
                <Mail className="size-4 text-[#65b719]" />
                Liên hệ qua trang hỗ trợ
              </p>
            </div>
          </section>

          {/* Company */}
          <section>
            <h3 className="mb-6 text-lg font-semibold text-white">
              Về chúng tôi
            </h3>

            <ul className="space-y-3 text-sm">
              {companyLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="transition-colors hover:text-[#65b719]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Support */}
          <section>
            <h3 className="mb-6 text-lg font-semibold text-white">
              Hỗ trợ khách hàng
            </h3>

            <ul className="space-y-3 text-sm">
              {supportLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="transition-colors hover:text-[#65b719]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Newsletter */}
          <section>
            <h3 className="mb-6 text-lg font-semibold text-white">
              Nhận tin khuyến mãi
            </h3>

            <p className="mb-5 text-sm leading-7 text-gray-400">
              Đăng ký email để nhận thông tin sản phẩm mới
              và chương trình ưu đãi.
            </p>

            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setMessage("")
                }}
                placeholder="Địa chỉ email..."
                aria-label="Địa chỉ email nhận tin"
                className="min-w-0 flex-1 rounded-l-md bg-white px-3 py-3 text-sm text-gray-900 outline-none"
              />

              <button
                type="submit"
                aria-label="Đăng ký nhận tin"
                className="rounded-r-md bg-[#65b719] px-4 text-white transition hover:bg-[#4d9210]"
              >
                <Send size={18} />
              </button>
            </form>

            {message && (
              <p role="status" className="mt-3 text-xs text-gray-300">
                {message}
              </p>
            )}

            <h4 className="mt-7 mb-3 text-sm font-semibold text-white">
              Kết nối với chúng tôi
            </h4>

            <div className="flex gap-3">
              {[
                { name: "Facebook", Icon: Facebook },
                { name: "Instagram", Icon: Instagram },
                { name: "YouTube", Icon: Youtube },
              ].map(({ name, Icon }) => (
                <span
                  key={name}
                  title={`${name} - đang cập nhật`}
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-gray-600 text-gray-300"
                >
                  <Icon className="h-[17px] w-[17px]" />
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 text-center text-xs text-gray-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Phụ Kiện Giá Xưởng. Bảo lưu mọi quyền.</p>
          <p>Thiết kế cho Project Final 197</p>
        </div>
      </div>

      {/* Back to top */}
      <button
        type="button"
        onClick={backToTop}
        aria-label="Trở về đầu trang"
        className="fixed bottom-6 right-6 z-40 flex size-11 items-center justify-center rounded-full bg-[#65b719] text-white shadow-lg transition hover:bg-[#4d9210]"
      >
        <ArrowUp size={20} />
      </button>
    </footer>
  )
}
