
import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import {
  ChevronRight,
  Headphones,
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
          className="flex items-center gap-2 py-7 text-xs text-gray-500"
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
        {/* Decorative circles */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full border-[45px] border-[#55b000]/15"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full border-[55px] border-[#55b000]/10"
        />

        <div className="relative mx-auto flex min-h-[280px] max-w-[1440px] flex-col items-center justify-center px-5 py-14 text-center sm:min-h-[340px]">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#55b000]/40 bg-[#55b000]/15">
            <Headphones size={30} className="text-[#99df54]" />
          </div>

          <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#99df54]">
            HỖ TRỢ TỪ DEMO STORE
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-wide sm:text-4xl lg:text-5xl">
            LIÊN HỆ
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-gray-300 sm:text-base">
            Chúng tôi luôn sẵn sàng hỗ trợ. Hãy liên hệ và cho chúng tôi biết bạn cần giúp đỡ điều gì.
          </p>

          <div className="mt-6 h-1 w-16 rounded-full bg-[#55b000]" />
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="mx-auto w-full max-w-[1440px] px-5 py-14 sm:py-20">
        <div className="mb-12 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#55b000]">
            KẾT NỐI VỚI CHÚNG TÔI
          </span>

          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            Chúng tôi mong nhận được ý kiến của bạn
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-500">
            Bạn có thắc mắc về sản phẩm hoặc dịch vụ? Hãy gửi lời nhắn cho chúng tôi.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          {/* CONTACT FORM */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-9">
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
                  rows={7}
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

          {/* LOCATION - NO IMAGE OR MAP API */}
          <div className="flex min-h-[450px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-[#f4f7f2]">
            <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-8 py-12 text-center">
              {/* Decorative grid */}
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "linear-gradient(#d6dfd1 1px, transparent 1px), linear-gradient(90deg, #d6dfd1 1px, transparent 1px)",
                  backgroundSize: "38px 38px",
                }}
              />

              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#55b000] shadow-lg">
                <MapPin size={35} />
              </div>

              <h3 className="relative mt-6 text-2xl font-bold">
                Tìm cửa hàng của chúng tôi
              </h3>

              <p className="relative mt-3 max-w-sm text-sm leading-7 text-gray-500">
                Vị trí cửa hàng và bản đồ sẽ được cập nhật khi địa chỉ chính thức được xác nhận.
              </p>
            </div>

            <div className="bg-[#223328] px-6 py-6 text-center text-white">
              <p className="text-sm font-bold">
                DEMO STORE
              </p>

              <p className="mt-2 text-xs leading-6 text-gray-300">
                Thông tin cửa hàng sẽ sớm được cập nhật.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT DETAILS - NO BACKGROUND IMAGE */}
      <section className="relative overflow-hidden bg-[#223328]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full border-[45px] border-[#55b000]/10"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-36 right-0 h-96 w-96 rounded-full border-[55px] border-[#55b000]/10"
        />

        <div className="relative mx-auto w-full max-w-[1440px] px-5 py-16 sm:py-20">
          <div className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#9ee15c]">
              THÔNG TIN LIÊN HỆ
            </span>

            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              Cách liên hệ với chúng tôi
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* ADDRESS */}
            <div className="rounded-xl bg-white p-7 shadow-lg transition-transform duration-300 hover:-translate-y-1 sm:p-9">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#55b000]/10 text-[#55b000]">
                <MapPin size={25} />
              </div>

              <h3 className="mt-6 text-sm font-bold uppercase tracking-wider">
                ĐỊA CHỈ
              </h3>

              <div className="mt-4 h-0.5 w-12 bg-[#55b000]" />

              <p className="mt-5 text-sm font-semibold">
                DEMO STORE
              </p>

              <p className="mt-2 text-sm leading-7 text-gray-500">
                Địa chỉ chính thức sẽ được cập nhật khi cửa hàng ra mắt.
              </p>
            </div>

            {/* EMAIL */}
            <div className="rounded-xl bg-white p-7 shadow-lg transition-transform duration-300 hover:-translate-y-1 sm:p-9">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#55b000]/10 text-[#55b000]">
                <Mail size={25} />
              </div>

              <h3 className="mt-6 text-sm font-bold uppercase tracking-wider">
                EMAIL
              </h3>

              <div className="mt-4 h-0.5 w-12 bg-[#55b000]" />

              <p className="mt-5 text-sm font-semibold">
                Hỗ trợ khách hàng
              </p>

              <p className="mt-2 text-sm leading-7 text-gray-500">
                Địa chỉ email chính thức sẽ sớm được công bố.
              </p>
            </div>

            {/* PHONE */}
            <div className="rounded-xl bg-white p-7 shadow-lg transition-transform duration-300 hover:-translate-y-1 sm:p-9">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#55b000]/10 text-[#55b000]">
                <Phone size={25} />
              </div>

              <h3 className="mt-6 text-sm font-bold uppercase tracking-wider">
                ĐIỆN THOẠI
              </h3>

              <div className="mt-4 h-0.5 w-12 bg-[#55b000]" />

              <p className="mt-5 text-sm font-semibold">
                Chăm sóc khách hàng
              </p>

              <p className="mt-2 text-sm leading-7 text-gray-500">
                Số điện thoại sẽ sớm được cập nhật.
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <Clock3 size={15} />
                Giờ làm việc sẽ được thông báo sau
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
