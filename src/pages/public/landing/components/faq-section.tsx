"use client"

import { CircleHelp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

type FaqItem = {
  value: string
  question: string
  answer: string
}

const faqItems: FaqItem[] = [
  {
    value: "item-1",
    question: "Làm thế nào để tích hợp thành phần ShadcnStore vào dự án?",
    answer:
      "Các thành phần sử dụng shadcn/ui và hoạt động với React, Next.js và Vite. Sao chép mã thành phần, cài các thư viện cần thiết rồi tích hợp vào dự án. Mỗi thành phần đều có hướng dẫn và ví dụ.",
  },
  {
    value: "item-2",
    question: "Thành phần miễn phí và cao cấp khác nhau thế nào?",
    answer:
      "Thành phần miễn phí bao gồm nút bấm, biểu mẫu và bố cục cơ bản. Gói cao cấp cung cấp bảng dữ liệu nâng cao, bảng phân tích, luồng xác thực và giao diện quản trị hoàn chỉnh, kèm tệp Figma, hỗ trợ ưu tiên và giấy phép thương mại.",
  },
  {
    value: "item-3",
    question: "Tôi có thể sử dụng các thành phần trong dự án thương mại không?",
    answer:
      "Có. Thành phần miễn phí sử dụng giấy phép MIT. Thành phần cao cấp có giấy phép thương mại cho phép dùng trong dự án khách hàng, ứng dụng SaaS và sản phẩm thương mại mà không cần ghi nguồn.",
  },
  {
    value: "item-4",
    question: "Có hỗ trợ và cập nhật không?",
    answer:
      "Người dùng miễn phí có thể nhận hỗ trợ qua Discord và GitHub. Người dùng cao cấp được hỗ trợ email ưu tiên, cập nhật thường xuyên và tiếp cận sớm các bản phát hành mới. Các thành phần cũng được duy trì tương thích với shadcn/ui.",
  },
  {
    value: "item-5",
    question: "Những nền tảng và công cụ nào được hỗ trợ?",
    answer:
      "Các thành phần hoạt động với React 18+, Next.js 13+ và Vite, sử dụng TypeScript, Tailwind CSS và quy ước shadcn/ui. Chúng được kiểm tra với React Hook Form, TanStack Query và Zustand.",
  },
  {
    value: "item-6",
    question: "Bao lâu có thành phần mới?",
    answer:
      "Chúng tôi phát hành thành phần và giao diện mẫu mới hằng tuần. Người dùng cao cấp được tiếp cận sớm; thành phần miễn phí được cập nhật dựa trên phản hồi cộng đồng. Bạn có thể theo dõi lộ trình và đề xuất qua GitHub.",
  },
]

const FaqSection = () => {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Hỏi đáp
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Câu hỏi thường gặp
          </h2>
          <p className="text-lg text-muted-foreground">
            Thông tin về thành phần ShadcnStore, giấy phép và cách tích hợp. Chúng tôi luôn sẵn sàng giải đáp thêm.
          </p>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-transparent">
            <div className="p-0">
              <Accordion className="gap-5">
                {faqItems.map((item) => (
                  <AccordionItem
                    key={item.value}
                    value={item.value}
                    className="rounded-md border! bg-transparent"
                  >
                    <AccordionTrigger className="cursor-pointer items-center gap-4 rounded-none bg-transparent py-2 ps-3 pe-4 hover:no-underline data-panel-open:border-b">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                          <CircleHelp className="size-5" />
                        </div>
                        <span className="text-start font-semibold">
                          {item.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 bg-transparent">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Contact Support CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Bạn vẫn còn thắc mắc? Chúng tôi luôn sẵn sàng hỗ trợ.
            </p>
            <Button
              className="cursor-pointer"
              nativeButton={false}
              render={<a href="#contact" />}
            >
              Liên hệ hỗ trợ
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export { FaqSection }
