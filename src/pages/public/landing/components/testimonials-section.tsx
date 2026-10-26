"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

type Testimonial = {
  name: string
  role: string
  image: string
  quote: string
}

const testimonials: Testimonial[] = [
  {
    name: "Alexandra Mitchell",
    role: "Lập trình viên giao diện cấp cao",
    image: "https://notion-avatars.netlify.app/api/avatar?preset=female-1",
    quote:
      "Nền tảng đã thay đổi quy trình phát triển của chúng tôi. Hệ thống thành phần có kiến trúc rõ ràng, giúp việc xây dựng ứng dụng phức tạp trở nên đơn giản.",
  },
  {
    name: "James Thompson",
    role: "Trưởng nhóm kỹ thuật",
    image: "https://notion-avatars.netlify.app/api/avatar?preset=male-1",
    quote:
      "Sau khi thử nhiều nền tảng, chúng tôi đã tìm được lựa chọn phù hợp. Tài liệu rất đầy đủ và dễ hiểu.",
  },
  {
    name: "Priya Sharma",
    role: "Nhà thiết kế sản phẩm",
    image: "https://notion-avatars.netlify.app/api/avatar?preset=female-2",
    quote:
      "Hệ thống thiết kế đẹp và nhất quán. Tôi có thể tạo nguyên mẫu nhanh và chuyển cho lập trình viên với sự tin tưởng vào kết quả triển khai.",
  },
  {
    name: "Robert Kim",
    role: "Quản lý kỹ thuật",
    image: "https://notion-avatars.netlify.app/api/avatar?preset=male-2",
    quote:
      "Chúng tôi chuyển toàn bộ ứng dụng sang nền tảng này trong hai tuần và nhận thấy hiệu năng cải thiện ngay lập tức.",
  },
  {
    name: "Maria Santos",
    role: "Kỹ sư phát triển toàn diện",
    image: "https://notion-avatars.netlify.app/api/avatar?preset=female-3",
    quote:
      "Các tính năng hỗ trợ tiếp cận rất tốt. Mỗi thành phần đều tuân theo quy chuẩn, còn bộ kiểm thử tự động giúp duy trì khả năng tiếp cận trong suốt quá trình phát triển.",
  },
  {
    name: "Thomas Anderson",
    role: "Kiến trúc sư giải pháp",
    image: "https://notion-avatars.netlify.app/api/avatar?preset=male-3",
    quote:
      "Khả năng mở rộng từng là mối lo lớn nhất, nhưng nền tảng này đáp ứng tốt độ phức tạp của ứng dụng doanh nghiệp.",
  },
  {
    name: "Lisa Chang",
    role: "UX Researcher",
    image: "https://notion-avatars.netlify.app/api/avatar?preset=female-4",
    quote:
      "Kết quả kiểm thử người dùng luôn tích cực từ khi chúng tôi sử dụng nền tảng. Trải nghiệm trực quan và hiệu năng tốt đã giúp mức độ hài lòng tăng 40%.",
  },
  {
    name: "Michael Foster",
    role: "DevOps Engineer",
    image: "https://notion-avatars.netlify.app/api/avatar?preset=male-4",
    quote:
      "Triển khai và bảo trì rất thuận tiện. Nền tảng tích hợp tốt với quy trình CI/CD của chúng tôi.",
  },
  {
    name: "Sophie Laurent",
    role: "Giám đốc sáng tạo",
    image: "https://notion-avatars.netlify.app/api/avatar?preset=female-5",
    quote:
      "Chúng tôi có thể hiện thực hóa ý tưởng thiết kế mà vẫn bảo đảm chất lượng kỹ thuật và trải nghiệm người dùng.",
  },
  {
    name: "Daniel Wilson",
    role: "Lập trình viên máy chủ",
    image: "https://notion-avatars.netlify.app/api/avatar?preset=male-5",
    quote:
      "Thiết kế API rõ ràng, trực quan và có tài liệu đầy đủ.",
  },
  {
    name: "Natasha Petrov",
    role: "Lập trình viên ứng dụng di động",
    image: "https://notion-avatars.netlify.app/api/avatar?preset=female-6",
    quote:
      "Cross-platform development has never been this efficient. One codebase, multiple platforms, consistent user experience. This is the future. The responsive design system ensures our apps look perfect on every device.",
  },
  {
    name: "Carlos Rivera",
    role: "Nhà sáng lập công ty khởi nghiệp",
    image: "https://notion-avatars.netlify.app/api/avatar?preset=male-6",
    quote:
      "Dù không có chuyên môn kỹ thuật, tôi vẫn có thể tự tin xây dựng sản phẩm thử nghiệm nhanh chóng với nền tảng này.",
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 sm:py-32">
      <div className="container mx-auto px-8 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Nhận xét của khách hàng
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Đồng hành cùng đổi mới trên toàn cầu
          </h2>
          <p className="text-lg text-muted-foreground">
            Cùng hàng nghìn lập trình viên và đội ngũ sử dụng nền tảng để xây dựng trải nghiệm số chất lượng.
          </p>
        </div>

        {/* Testimonials Masonry Grid */}
        <div className="columns-1 gap-4 md:columns-2 md:gap-6 lg:columns-3 lg:gap-4">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="mb-6 break-inside-avoid shadow-none lg:mb-4"
            >
              <CardHeader className="flex flex-row items-start gap-4">
                <Avatar className="bg-muted size-12 shrink-0">
                  <AvatarImage
                    alt={testimonial.name}
                    src={testimonial.image}
                    loading="lazy"
                    width="120"
                    height="120"
                  />
                  <AvatarFallback>
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <CardTitle>{testimonial.name}</CardTitle>
                  <CardDescription className="tracking-wide">
                    {testimonial.role}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <blockquote>
                  <p className="text-sm leading-relaxed text-balance">
                    {testimonial.quote}
                  </p>
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
