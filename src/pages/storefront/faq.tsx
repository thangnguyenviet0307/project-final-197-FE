import { useMemo, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  ChevronDown,
  CircleHelp,
  Search,
} from "lucide-react"

type FAQItem = {
  question: string
  answer: ReactNode
  searchText?: string
}

type FAQCategory = {
  id: string
  label: string
  title: string
  questions: FAQItem[]
}

const categories: FAQCategory[] = [
  {
    id: "shopping",
    label: "Sản phẩm",
    title: "Tìm kiếm và xem sản phẩm",
    questions: [
      {
        question: "Tôi có thể tìm sản phẩm như thế nào?",
        searchText: "danh mục tìm kiếm khám phá sản phẩm trang khám phá",
        answer: (
          <>
            Bạn có thể khám phá theo danh mục hoặc sử dụng ô tìm kiếm ở đầu
            trang. Trang <Link to="/shop" className="font-semibold text-[#4d9210] underline">Khám phá</Link> hiển thị danh sách sản phẩm; chọn một sản phẩm để xem trang chi tiết.
          </>
        ),
      },
      {
        question: "Tôi có thể tìm theo tên sản phẩm hoặc thương hiệu không?",
        answer:
          "Có. Nhập tên sản phẩm hoặc thương hiệu vào ô tìm kiếm trên đầu trang. Bạn cũng có thể bắt đầu từ danh mục sản phẩm để thu hẹp lựa chọn.",
      },
      {
        question: "Vì sao tôi không tìm thấy sản phẩm mình cần?",
        answer:
          "Có thể sản phẩm chưa có trong danh mục công khai, tên tìm kiếm chưa khớp hoặc catalog đang được cập nhật. Hãy thử từ khóa ngắn hơn hoặc duyệt danh mục.",
      },
      {
        question: "Trang chi tiết sản phẩm có những thông tin gì?",
        answer:
          "Tùy sản phẩm, trang chi tiết có thể hiển thị hình ảnh, mô tả, thông số, các lựa chọn phiên bản và đánh giá. Hãy xem nội dung cụ thể trên trang của từng sản phẩm vì thông tin có thể khác nhau.",
      },
      {
        question: "Tôi có thể chọn phiên bản sản phẩm ở đâu?",
        answer:
          "Nếu sản phẩm có nhiều phiên bản, các lựa chọn sẽ hiển thị trên trang chi tiết. Thông tin của từng phiên bản có thể khác nhau; hãy kiểm tra lựa chọn đang hiển thị trước khi tham khảo giá.",
      },
      {
        question: "Giá và tình trạng sản phẩm có được đảm bảo không?",
        answer:
          "Đây là storefront đang trong quá trình hoàn thiện. Thông tin hiển thị nhằm mục đích tham khảo và chưa phải xác nhận cho một giao dịch. Hiện chưa có luồng đặt hàng để xác nhận giá hoặc tồn kho.",
      },
      {
        question: "Giá hiển thị có phải là tổng tiền tôi cần thanh toán không?",
        answer:
          "Không. Giá trên trang sản phẩm chỉ là thông tin đang hiển thị. Website chưa có checkout để xác nhận giá cuối cùng, phí giao hàng hay bất kỳ khoản thanh toán nào.",
      },
      {
        question: "Tôi có thể gửi đánh giá sản phẩm không?",
        answer:
          "Một số trang chi tiết có biểu mẫu gửi đánh giá. Nếu biểu mẫu được hiển thị, bạn có thể nhập nội dung theo hướng dẫn tại đó. Đánh giá không đồng nghĩa với xác nhận rằng sản phẩm đã được mua qua storefront.",
      },
      {
        question: "Làm sao để biết đánh giá đến từ đâu?",
        answer:
          "Trang sản phẩm hiển thị thông tin nguồn đánh giá khi có dữ liệu. Đánh giá do người dùng gửi không được xác nhận là đánh giá từ người đã mua hàng.",
      },
    ],
  },
  {
    id: "account",
    label: "Tài khoản",
    title: "Đăng ký và tài khoản",
    questions: [
      {
        question: "Tôi có cần tài khoản để xem sản phẩm không?",
        answer:
          "Không. Danh mục và thông tin sản phẩm công khai có thể được xem mà không cần đăng nhập. Tài khoản khách hàng dành cho các tính năng hồ sơ và lịch sử đơn hàng hiện có.",
      },
      {
        question: "Làm thế nào để đăng ký hoặc đăng nhập?",
        searchText: "thành viên tạo tài khoản đăng ký đăng nhập",
        answer: (
          <>
            Mở trang <Link to="/thanh-vien?act=register" className="font-semibold text-[#4d9210] underline">Thành viên</Link> để tạo tài khoản hoặc <Link to="/thanh-vien?act=login" className="font-semibold text-[#4d9210] underline">đăng nhập</Link> bằng tài khoản khách hàng.
          </>
        ),
      },
      {
        question: "Tôi có thể quản lý những gì trong tài khoản?",
        searchText:
          "hồ sơ địa chỉ giao hàng mặc định đổi mật khẩu lịch sử đơn hàng tài khoản",
        answer: (
          <>
            Tài khoản khách hàng hiện có trang hồ sơ, địa chỉ giao hàng mặc
            định, đổi mật khẩu và lịch sử đơn hàng gắn với tài khoản. Mở{" "}
            <Link to="/account/profile" className="font-semibold text-[#4d9210] underline">trang tài khoản</Link> để xem các mục này.
          </>
        ),
      },
      {
        question: "Tôi có thể cập nhật hồ sơ khách hàng không?",
        answer:
          "Có. Trong trang hồ sơ, bạn có thể cập nhật họ tên, ngày sinh, giới tính và số điện thoại. Email đăng nhập được hiển thị để tham khảo và không chỉnh sửa tại trang này.",
      },
      {
        question: "Tôi có thể đổi mật khẩu khi đang đăng nhập không?",
        answer: (
          <>
            Có. Vào{" "}
            <Link to="/account/change-password" className="font-semibold text-[#4d9210] underline">
              trang đổi mật khẩu
            </Link>{" "}
            trong tài khoản và làm theo hướng dẫn.
          </>
        ),
      },
      {
        question: "Tôi có thể đặt lại mật khẩu nếu quên không?",
        answer:
          "Hiện storefront chưa có luồng tự phục vụ để đặt lại mật khẩu. Không gửi mật khẩu hoặc thông tin nhạy cảm qua biểu mẫu liên hệ.",
      },
      {
        question: "Tôi có thể đổi email đăng nhập trong hồ sơ không?",
        answer:
          "Không. Email đăng nhập hiện chỉ hiển thị trong hồ sơ và không thể thay đổi từ trang tài khoản.",
      },
    ],
  },
  {
    id: "orders",
    label: "Đặt hàng",
    title: "Đặt hàng và thanh toán",
    questions: [
      {
        question: "Tôi có thể đặt hàng hoặc thanh toán trên website không?",
        answer:
          "Chưa. Giỏ hàng, checkout và tạo đơn hàng dành cho khách chưa được triển khai. Không chuyển khoản hoặc cung cấp thông tin thanh toán dựa trên nội dung tham khảo trên website.",
      },
      {
        question: "Lịch sử đơn hàng trong tài khoản có ý nghĩa gì?",
        answer:
          "Lịch sử chỉ hiển thị các đơn hàng đã được tạo và liên kết với đúng tài khoản khách hàng. Storefront hiện không tạo đơn mới, vì vậy trang này không phải biên nhận đặt hàng từ website.",
      },
      {
        question: "Tôi có thể theo dõi hoặc hủy đơn hàng ở đây không?",
        answer:
          "Website hiện chỉ hỗ trợ xem danh sách lịch sử đơn hàng có sẵn trong tài khoản; chưa có quy trình đặt hàng, theo dõi giao hàng hoặc hủy đơn dành cho khách.",
      },
      {
        question: "Làm thế nào để biết website đã nhận đơn hàng của tôi?",
        answer:
          "DemoStore chưa nhận đơn đặt hàng trực tuyến. Việc xem sản phẩm hoặc đăng ký tài khoản không tạo đơn hàng; chỉ các đơn hàng có sẵn mới xuất hiện trong lịch sử tài khoản.",
      },
    ],
  },
  {
    id: "policies",
    label: "Giao hàng & chính sách",
    title: "Giao hàng, đổi trả và bảo hành",
    questions: [
      {
        question: "Phí và thời gian giao hàng là bao nhiêu?",
        answer:
          "Chưa có đơn hàng trực tuyến nên website hiện chưa công bố phí hoặc thời gian giao hàng. Không nên dựa vào thời hạn ước tính chưa được xác nhận.",
      },
      {
        question: "Chính sách đổi trả và bảo hành như thế nào?",
        answer:
          "Các chính sách đổi trả và bảo hành chính thức chưa được công bố trên storefront. Hãy kiểm tra thông tin cụ thể trên sản phẩm; website hiện chưa thể xác nhận điều kiện hay thời hạn áp dụng.",
      },
      {
        question: "Địa chỉ giao hàng trong hồ sơ được dùng để làm gì?",
        answer:
          "Đây là thông tin địa chỉ mặc định được lưu riêng trong hồ sơ khách hàng. Vì checkout chưa khả dụng, việc lưu địa chỉ hiện không tạo đơn hoặc yêu cầu giao hàng.",
      },
      {
        question: "Tôi có thể lưu hoặc sửa địa chỉ mặc định không?",
        answer:
          "Tài khoản có mục địa chỉ để lưu hoặc cập nhật địa chỉ mặc định. Địa chỉ này hiện chưa được dùng để tạo yêu cầu giao hàng vì checkout chưa khả dụng.",
      },
    ],
  },
  {
    id: "help",
    label: "Hỗ trợ",
    title: "Liên hệ và góp ý",
    questions: [
      {
        question: "Tôi có thể gửi câu hỏi qua trang Liên hệ không?",
        searchText:
          "liên hệ giao diện nhập lời nhắn biểu mẫu gửi thông tin đội ngũ hỗ trợ",
        answer: (
          <>
            Trang <Link to="/contact" className="font-semibold text-[#4d9210] underline">Liên hệ</Link> hiện có giao diện nhập lời nhắn nhưng chưa kết nối dịch vụ gửi. Vì vậy, gửi biểu mẫu chưa chuyển thông tin đến đội ngũ hỗ trợ và chưa tạo yêu cầu cần phản hồi.
          </>
        ),
      },
      {
        question: "Tôi cần lưu ý gì khi sử dụng DemoStore?",
        answer:
          "Hãy xem website như một trải nghiệm khám phá và tham khảo sản phẩm. Không nhập dữ liệu thanh toán, thông tin định danh nhạy cảm hoặc mật khẩu vào các biểu mẫu không có chức năng tương ứng.",
      },
      {
        question: "Tôi gặp lỗi khi xem trang hoặc sản phẩm thì nên làm gì?",
        answer:
          "Tải lại trang và thử lại sau. Nếu lỗi vẫn tiếp tục, bạn có thể xem trang Liên hệ để biết giao diện hỗ trợ hiện có; biểu mẫu tại đó chưa gửi thông tin đến đội ngũ hỗ trợ.",
      },
    ],
  },
]

const allCategories = { id: "all", label: "Tất cả" }

export default function StorefrontFAQPage() {
  const [activeCategory, setActiveCategory] = useState(allCategories.id)
  const [search, setSearch] = useState("")

  const visibleCategories = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi")

    return categories
      .filter(
        (category) =>
          activeCategory === allCategories.id ||
          category.id === activeCategory
      )
      .map((category) => ({
        ...category,
        questions: category.questions.filter((item) => {
          if (!query) return true

          const answerText =
            item.searchText ??
            (typeof item.answer === "string" ? item.answer : "")
          return `${category.title} ${item.question} ${answerText}`
            .toLocaleLowerCase("vi")
            .includes(query)
        }),
      }))
      .filter((category) => category.questions.length > 0)
  }, [activeCategory, search])

  const visibleQuestionCount = visibleCategories.reduce(
    (total, category) => total + category.questions.length,
    0
  )

  return (
    <div className="bg-white text-gray-900">
      <section className="bg-[#223328] text-white">
        <div className="store-container py-12 sm:py-16">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#99df54]">
            <CircleHelp size={15} aria-hidden="true" />
            HỖ TRỢ DEMOSTORE
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Câu hỏi thường gặp
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-300 sm:text-base">
            Tìm câu trả lời về sản phẩm, tài khoản và những tính năng hiện có
            trên website.
          </p>
          <div className="mt-7 h-1 w-16 rounded-full bg-[#55b000]" />
        </div>
      </section>

      <section className="store-container py-10 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <div className="relative">
            <label htmlFor="faq-search" className="sr-only">
              Tìm câu hỏi
            </label>
            <Search
              size={19}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              id="faq-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Bạn muốn tìm hiểu điều gì?"
              className="w-full rounded-xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-sm outline-none transition focus:border-[#55b000] focus:ring-4 focus:ring-[#55b000]/10"
            />
          </div>

          <div
            className="mt-5 flex flex-wrap gap-2"
            aria-label="Lọc câu hỏi theo chủ đề"
          >
            {[allCategories, ...categories].map((category) => {
              const isActive = activeCategory === category.id
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveCategory(category.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "border-[#55b000] bg-[#55b000] text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-[#55b000] hover:text-[#4d9210]"
                  }`}
                >
                  {category.label}
                </button>
              )
            })}
          </div>

          <p className="mt-5 text-sm text-gray-500" aria-live="polite">
            {visibleQuestionCount > 0
              ? `${visibleQuestionCount} câu hỏi`
              : "Không tìm thấy câu hỏi phù hợp"}
          </p>

          {visibleCategories.length > 0 ? (
            <div className="mt-8 space-y-10">
              {visibleCategories.map((category) => (
                <section key={category.id} aria-labelledby={`faq-${category.id}`}>
                  <h2
                    id={`faq-${category.id}`}
                    className="mb-4 text-xl font-bold sm:text-2xl"
                  >
                    {category.title}
                  </h2>
                  <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
                    {category.questions.map((item) => (
                      <details key={item.question} className="group px-5 sm:px-6">
                        <summary className="flex list-none items-center justify-between gap-4 py-5 text-left font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
                          <span>{item.question}</span>
                          <ChevronDown
                            size={19}
                            aria-hidden="true"
                            className="shrink-0 text-[#4d9210] transition-transform group-open:rotate-180"
                          />
                        </summary>
                        <div className="max-w-3xl pb-5 pr-8 text-sm leading-7 text-gray-600">
                          {item.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-gray-300 px-6 py-12 text-center">
              <p className="font-semibold text-gray-800">
                Chưa có câu trả lời phù hợp
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Thử từ khóa khác hoặc xem toàn bộ chủ đề.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setActiveCategory(allCategories.id)
                }}
                className="mt-4 text-sm font-bold text-[#4d9210] hover:underline"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          <div className="mt-12 flex flex-col gap-4 rounded-2xl bg-[#f7faf5] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h2 className="text-lg font-bold">Bạn muốn khám phá thêm?</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Xem danh mục sản phẩm hoặc tìm hiểu thêm về DemoStore.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-md bg-[#55b000] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#4d9210]"
              >
                Đến cửa hàng
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-[#55b000] hover:text-[#4d9210]"
              >
                Về DemoStore
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
