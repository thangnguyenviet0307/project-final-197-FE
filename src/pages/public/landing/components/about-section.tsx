"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CardDecorator } from "@/components/ui/card-decorator"
import { Code, Palette, Layout, Crown } from "lucide-react"
import { Github } from "@/components/icons/brand-icons"

const values = [
  {
    icon: Code,
    title: "Ưu tiên lập trình viên",
    description:
      "Mỗi thành phần được xây dựng để dễ sử dụng, có mã nguồn rõ ràng và dễ tích hợp.",
  },
  {
    icon: Palette,
    title: "Thiết kế chất lượng",
    description:
      "Chúng tôi duy trì tiêu chuẩn thiết kế cao, tuân theo nguyên tắc shadcn/ui và các mẫu giao diện hiện đại.",
  },
  {
    icon: Layout,
    title: "Sẵn sàng triển khai",
    description:
      "Các thành phần đã được sử dụng trong ứng dụng thực tế, có hiệu năng và độ ổn định được kiểm chứng.",
  },
  {
    icon: Crown,
    title: "Chất lượng cao cấp",
    description:
      "Chú trọng từng chi tiết và tối ưu hiệu năng, mang lại trải nghiệm tốt và khả năng tiếp cận cho mọi người dùng.",
  },
]

export function AboutSection() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-4xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Về ShadcnStore
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Được lập trình viên xây dựng, dành cho lập trình viên
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Chúng tôi xây dựng thư viện thành phần và giao diện mẫu shadcn/ui để giúp lập trình viên phát triển giao diện quản trị đẹp mắt nhanh hơn.
          </p>
        </div>

        {/* Modern Values Grid with Enhanced Design */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4 mb-12">
          {values.map((value, index) => (
            <Card key={index} className="group shadow-xs py-2">
              <CardHeader className="items-center p-8 text-center">
                <CardDecorator>
                  <value.icon className="size-6" aria-hidden />
                </CardDecorator>
                <CardTitle className="mt-6 text-balance">
                  {value.title}
                </CardTitle>
                <CardDescription className="mt-3">
                  {value.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-muted-foreground">
              ❤️ Được xây dựng với tâm huyết dành cho cộng đồng lập trình viên
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="cursor-pointer"
              nativeButton={false}
              render={
                <a
                  href="https://github.com/shadcnstore/shadcn-dashboard-landing-template"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <Github data-icon="inline-start" />
              Đánh dấu sao trên GitHub
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="cursor-pointer"
              nativeButton={false}
              render={
                <a
                  href="https://discord.com/invite/XEQhPc9a6p"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              Tham gia cộng đồng Discord
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
