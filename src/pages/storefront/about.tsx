import {
  ArrowRight,
  Compass,
  Eye,
  Lightbulb,
  PackageSearch,
  Sparkles,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useAboutPageContent } from "@/features/storefront/hooks/use-storefront-page-content"
import { getApiError } from "@/services/api"

const principleIcons = [Eye, Compass, Lightbulb]

export default function StorefrontAboutPage() {
  const query = useAboutPageContent()

  if (query.isPending) {
    return (
      <main className="store-container py-20 text-center">
        <p role="status" className="text-sm text-gray-500">
          Đang tải thông tin DemoStore...
        </p>
      </main>
    )
  }

  if (query.isError) {
    return (
      <main className="store-container py-20 text-center">
        <div role="alert" className="mx-auto max-w-lg">
          <p className="font-semibold text-gray-800">
            Không thể tải thông tin giới thiệu.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            {getApiError(query.error).message}
          </p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="mt-4 font-semibold text-[#4d9210] underline"
          >
            Thử tải lại
          </button>
        </div>
      </main>
    )
  }

  const content = query.data

  return (
    <div className="bg-white text-gray-900">
      <section className="relative isolate overflow-hidden bg-[#223328] text-white">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-32 size-96 rounded-full bg-[#55b000]/20 blur-3xl"
        />
        <div className="store-container relative py-16 sm:py-24 lg:py-28">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#99df54]">
            <Sparkles size={15} aria-hidden="true" />
            {content.eyebrow}
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {content.title}
            <span className="block text-[#99df54]">{content.highlight}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-gray-300 sm:text-lg">
            {content.intro}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-md bg-[#65b719] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#4d9210]"
            >
              Khám phá sản phẩm
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 rounded-md border border-white/30 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Câu hỏi thường gặp
            </Link>
          </div>
        </div>
      </section>

      <section className="store-container py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#57952b]">
              {content.story.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {content.story.title}
            </h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-gray-600">
            {content.story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-[#f7faf5]">
        <div className="store-container py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#57952b]">
              BẠN CÓ THỂ LÀM GÌ?
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Mọi thứ cần thiết để tìm hiểu sản phẩm
            </h2>
          </div>
          <div className="mx-auto mt-9 grid max-w-5xl gap-4 sm:grid-cols-2">
            {content.offerings.map((item, index) => (
              <article
                key={item.title}
                className="flex gap-4 rounded-xl border border-gray-100 bg-white p-5 sm:p-6"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#55b000]/10 text-sm font-bold text-[#4d9210]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-gray-600">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="store-container py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#57952b]">
              CÁCH CHÚNG TÔI LÀM
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Một trải nghiệm đơn giản, hữu ích
            </h2>
          </div>
          <div className="mx-auto mt-10 grid max-w-6xl gap-5 md:grid-cols-3">
            {content.principles.map((item, index) => {
              const Icon = principleIcons[index % principleIcons.length]
              return (
                <article
                  key={item.title}
                  className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-7"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-[#55b000]/10 text-[#4d9210]">
                    <Icon size={23} aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    {item.description}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-[#f7faf5]">
        <div className="store-container py-16 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#57952b]">
                BẮT ĐẦU TỪ ĐÂU?
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Ba bước để khám phá DemoStore
              </h2>
            </div>
            <ol className="mt-9 grid gap-4 md:grid-cols-3">
              {content.steps.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-xl border border-gray-200 bg-white p-6 sm:p-7"
                >
                  <span className="text-sm font-extrabold tracking-widest text-[#57952b]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="store-container py-16 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 rounded-2xl border border-[#dcebcf] bg-[#f7faf5] p-6 sm:p-8 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#4d9210] shadow-sm">
            <PackageSearch size={24} aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">{content.notice.title}</h2>
            <p className="mt-2 text-sm leading-7 text-gray-600">
              {content.notice.description}
            </p>
          </div>
          <Link
            to="/faq"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#4d9210] hover:underline"
          >
            Xem câu hỏi thường gặp
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  )
}
