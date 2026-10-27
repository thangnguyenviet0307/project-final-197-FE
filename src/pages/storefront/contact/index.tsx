
import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import {
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Send,
  Clock3,
  MessageSquare,
} from "lucide-react"

type ContactForm = {
  name: string
  email: string
  subject: string
  message: string
}

const initialForm: ContactForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
}

const fieldClass =
  "w-full rounded-md border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#55b000] focus:ring-2 focus:ring-[#55b000]/10"

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>(initialForm)
  const [notice, setNotice] = useState("")

  const updateField = (
    field: keyof ContactForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))

    setNotice("")
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.subject.trim() ||
      form.message.trim().length < 10
    ) {
      setNotice(
        "Vui lòng điền đầy đủ thông tin và nhập lời nhắn có ít nhất 10 ký tự."
      )
      return
    }

    // Chưa có API gửi liên hệ dành cho khách hàng.
    setNotice(
      "Thông tin hợp lệ. Tính năng gửi lời nhắn hiện chưa khả dụng. Vui lòng quay lại sau."
    )
  }

  return (
    <div className="w-full bg-white text-gray-900">
      {/* BREADCRUMB */}
      <div className="mx-auto max-w-[1440px] px-5">
        <nav
          aria-label="Đường dẫn điều hướng"
          className="flex items-center gap-2 py-4 text-xs text-gray-500"
        >
          <Link
            to="/"
            className="transition-colors hover:text-[#55b000]"
          >
            Trang chủ
          </Link>

          <ChevronRight size={14} />

          <span className="text-gray-900">Liên hệ</span>
        </nav>
      </div>

      {/* HERO SECTION - NO IMAGE */}
      <section className="relative overflow-hidden bg-[#223328] text-white">
        <div className="relative mx-auto max-w-[1440px] px-5 py-8 sm:py-10">
          <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#99df54]">
            HỖ TRỢ TỪ DEMO STORE
          </span>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            LIÊN HỆ
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-7 text-gray-300 sm:text-base">
            Chúng tôi luôn sẵn sàng hỗ trợ. Hãy liên hệ và cho chúng tôi biết bạn cần giúp đỡ điều gì.
          </p>

          <div className="mt-6 h-1 w-16 rounded-full bg-[#55b000]" />
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:py-10">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-8">
          {/* CONTACT FORM */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#55b000]/10 text-[#55b000]">
                <MessageSquare size={23} />
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  Gửi lời nhắn cho chúng tôi
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Vui lòng điền thông tin bên dưới.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-sm font-medium"
                  >
                    Họ và tên *
                  </label>

                  <input
                    id="contact-name"
                    type="text"
                    required
                    maxLength={100}
                    autoComplete="name"
                    placeholder="Nhập họ và tên"
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block text-sm font-medium"
                  >
                    Địa chỉ email *
                  </label>

                  <input
                    id="contact-email"
                    type="email"
                    required
                    maxLength={150}
                    autoComplete="email"
                    placeholder="Nhập địa chỉ email"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-2 block text-sm font-medium"
                >
                  Chủ đề *
                </label>

                <input
                  id="contact-subject"
                  type="text"
                  required
                  maxLength={150}
                  placeholder="Nhập chủ đề bạn muốn trao đổi"
                  value={form.subject}
                  onChange={(event) =>
                    updateField("subject", event.target.value)
                  }
                  className={fieldClass}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-sm font-medium"
                >
                  Lời nhắn *
                </label>

                <textarea
                  id="contact-message"
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={5}
                  placeholder="Nhập lời nhắn tại đây..."
                  value={form.message}
                  onChange={(event) =>
                    updateField("message", event.target.value)
                  }
                  className={`${fieldClass} resize-y`}
                />
              </div>

              {notice && (
                <p
                  role="status"
                  aria-live="polite"
                  className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm leading-6 text-gray-700"
                >
                  {notice}
                </p>
              )}

              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#55b000] px-8 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#459000] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#55b000]"
              >
                <Send size={17} />
                GỬI LỜI NHẮN
              </button>

              <p className="text-xs leading-5 text-gray-400">
                Chế độ xem trước: lời nhắn chưa được gửi hoặc lưu lại.
              </p>
            </form>
          </div>

          <aside className="self-start rounded-xl border border-gray-200 bg-gray-50 p-6 sm:p-8" aria-label="Thông tin liên hệ">
            <h2 className="text-xl font-bold">Thông tin cửa hàng</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">Các kênh hỗ trợ chính thức sẽ được cập nhật khi cửa hàng ra mắt.</p>
            <div className="mt-6 space-y-6">
              {[
                { icon: MapPin, title: "Địa chỉ", description: "Địa chỉ và bản đồ sẽ được cập nhật khi cửa hàng ra mắt." },
                { icon: Mail, title: "Email", description: "Địa chỉ email chính thức sẽ sớm được công bố." },
                { icon: Phone, title: "Điện thoại", description: "Số điện thoại sẽ sớm được cập nhật." },
                { icon: Clock3, title: "Giờ làm việc", description: "Giờ làm việc sẽ được thông báo sau." },
              ].map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-start gap-3">
                  <Icon size={20} className="mt-1 shrink-0 text-[#459000]" aria-hidden="true" />
                  <div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-gray-600">{description}</p></div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>


    </div>
  )
}
