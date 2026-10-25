"use client"

import {
  BarChart3,
  Zap,
  Users,
  ArrowRight,
  Database,
  Package,
  Crown,
  Layout,
  Palette,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Image3D } from "@/components/image-3d"

const mainFeatures = [
  {
    icon: Package,
    title: "Thư viện thành phần chọn lọc",
    description:
      "Các khối giao diện và mẫu được chọn lọc về chất lượng và độ tin cậy.",
  },
  {
    icon: Crown,
    title: "Lựa chọn miễn phí và cao cấp",
    description:
      "Bắt đầu miễn phí, nâng cấp lên bộ sưu tập cao cấp khi cần thêm tính năng.",
  },
  {
    icon: Layout,
    title: "Giao diện mẫu sẵn dùng",
    description: "Sao chép và sử dụng thành phần ngay trong dự án.",
  },
  {
    icon: Zap,
    title: "Cập nhật thường xuyên",
    description: "Khối giao diện và mẫu mới được bổ sung hằng tuần.",
  },
]

const secondaryFeatures = [
  {
    icon: BarChart3,
    title: "Hỗ trợ nhiều nền tảng",
    description:
      "Tương thích React, Next.js và Vite để phát triển linh hoạt.",
  },
  {
    icon: Palette,
    title: "Công nghệ hiện đại",
    description: "Được xây dựng bằng shadcn/ui, Tailwind CSS và TypeScript.",
  },
  {
    icon: Users,
    title: "Thiết kế thích ứng",
    description: "Thành phần ưu tiên thiết bị di động, phù hợp mọi kích thước màn hình.",
  },
  {
    icon: Database,
    title: "Thuận tiện cho lập trình viên",
    description:
      "Mã nguồn rõ ràng, tài liệu đầy đủ, dễ tích hợp và tùy chỉnh.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Tính năng thư viện
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Mọi thứ cần thiết để xây dựng ứng dụng web
          </h2>
          <p className="text-lg text-muted-foreground">
            Thư viện cung cấp các khối giao diện, mẫu, trang giới thiệu và bảng quản trị được chọn lọc để phát triển ứng dụng chuyên nghiệp nhanh hơn.
          </p>
        </div>

        {/* First Feature Section */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16 mb-24">
          {/* Left Image */}
          <Image3D
            lightSrc="feature-1-light.png"
            darkSrc="feature-1-dark.png"
            alt="Bảng phân tích"
            direction="left"
          />
          {/* Right Content */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Thành phần giúp tăng tốc phát triển
              </h3>
              <p className="text-muted-foreground text-base text-pretty">
                Các khối giao diện và mẫu cao cấp giúp tiết kiệm thời gian và duy trì sự nhất quán trong dự án quản trị.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {mainFeatures.map((feature, index) => (
                <li
                  key={index}
                  className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors"
                >
                  <div className="mt-0.5 flex shrink-0 items-center justify-center">
                    <feature.icon
                      className="size-5 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 pe-4 pt-2">
              <Button size="lg" className="cursor-pointer">
                <a
                  href="https://shadcnstore.com/templates"
                  className="flex items-center"
                >
                  Khám phá giao diện mẫu
                  <ArrowRight className="ms-2 size-4" aria-hidden="true" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="cursor-pointer">
                <a href="https://shadcnstore.com/blocks">Xem thành phần</a>
              </Button>
            </div>
          </div>
        </div>

        {/* Second Feature Section - Flipped Layout */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16">
          {/* Left Content */}
          <div className="flex flex-col gap-6 order-2 lg:order-1">
            <div className="flex flex-col gap-4">
              <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Dành cho quy trình phát triển hiện đại
              </h3>
              <p className="text-muted-foreground text-base text-pretty">
                Mỗi thành phần sử dụng TypeScript, thiết kế thích ứng và kiến trúc rõ ràng để dễ dàng tích hợp vào dự án.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {secondaryFeatures.map((feature, index) => (
                <li
                  key={index}
                  className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors"
                >
                  <div className="mt-0.5 flex shrink-0 items-center justify-center">
                    <feature.icon
                      className="size-5 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 pe-4 pt-2">
              <Button size="lg" className="cursor-pointer">
                <a href="#" className="flex items-center">
                  Xem tài liệu
                  <ArrowRight className="ms-2 size-4" aria-hidden="true" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="cursor-pointer">
                <a
                  href="https://github.com/shadcnstore/shadcn-dashboard-landing-template"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Kho mã GitHub
                </a>
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <Image3D
            lightSrc="feature-2-light.png"
            darkSrc="feature-2-dark.png"
            alt="Bảng hiệu suất"
            direction="right"
            className="order-1 lg:order-2"
          />
        </div>
      </div>
    </section>
  )
}
