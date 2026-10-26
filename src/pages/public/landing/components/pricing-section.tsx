"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useState } from "react"
import { cn } from "@/utils/utils"

const plans = [
  {
    name: "Free",
    description: "Phù hợp để bắt đầu với các thành phần thiết yếu",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Truy cập hơn 50 thành phần miễn phí",
      "Mẫu bảng điều khiển cơ bản",
      "Hỗ trợ từ cộng đồng",
      "GitHub repository access",
      "Tài liệu và hướng dẫn",
    ],
    cta: "Bắt đầu",
    popular: false,
  },
  {
    name: "Pro",
    description: "Dành cho lập trình viên cần mẫu và thành phần cao cấp",
    monthlyPrice: 19,
    yearlyPrice: 15,
    features: [
      "Bộ sưu tập mẫu cao cấp",
      "Bố cục bảng điều khiển nâng cao",
      "Hỗ trợ ưu tiên",
      "Giấy phép sử dụng thương mại",
      "Tiếp cận sớm bản phát hành mới",
      "Tệp thiết kế Figma",
      "Yêu cầu thành phần tùy chỉnh",
      "Liên hệ trực tiếp với lập trình viên",
      "Tài nguyên thiết kế độc quyền",
    ],
    cta: "Bắt đầu",
    popular: true,
    includesPrevious: "Toàn bộ tính năng miễn phí, cùng với",
  },
  {
    name: "Lifetime",
    description: "Thanh toán một lần để truy cập trọn đời",
    monthlyPrice: 299,
    yearlyPrice: 299,
    features: [
      "Cập nhật và hỗ trợ trọn đời",
      "Kênh Discord riêng",
      "Không có phí định kỳ",
      "Truy cập các mẫu trong tương lai",
      "VIP support priority",
      "Tính năng thử nghiệm độc quyền",
    ],
    cta: "Bắt đầu",
    popular: false,
    includesPrevious: "Toàn bộ tính năng Pro, cùng với",
  },
]

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section id="pricing" className="py-24 sm:py-32 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Các gói dịch vụ
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Chọn gói phù hợp
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Bắt đầu với thành phần miễn phí hoặc nâng cấp lên Pro để sử dụng mẫu cao cấp và tính năng nâng cao.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-2">
            <ToggleGroup
              value={[isYearly ? "yearly" : "monthly"]}
              onValueChange={(value) =>
                value[0] && setIsYearly(value[0] === "yearly")
              }
              className="bg-secondary text-secondary-foreground border-none rounded-full p-1 cursor-pointer shadow-none"
            >
              <ToggleGroupItem
                value="monthly"
                className="data-pressed:bg-background data-pressed:border-border border-transparent border px-6 rounded-full! data-pressed:text-foreground hover:bg-transparent cursor-pointer transition-colors"
              >
                Hằng tháng
              </ToggleGroupItem>
              <ToggleGroupItem
                value="yearly"
                className="data-pressed:bg-background data-pressed:border-border border-transparent border px-6 rounded-full! data-pressed:text-foreground hover:bg-transparent cursor-pointer transition-colors"
              >
                Hằng năm
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-semibold">Tiết kiệm 20%</span> Khi thanh toán hằng năm
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border">
            <div className="grid lg:grid-cols-3">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-8 grid grid-rows-subgrid row-span-4 gap-6",
                    plan.popular
                      ? "my-2 mx-4 rounded-xl bg-card border-transparent shadow-xl ring-1 ring-foreground/10 backdrop-blur"
                      : ""
                  )}
                >
                  {/* Plan Header */}
                  <div>
                    <div className="text-lg font-medium tracking-tight mb-2">
                      {plan.name}
                    </div>
                    <div className="text-muted-foreground text-balance text-sm">
                      {plan.description}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <div className="text-4xl font-bold mb-1">
                      {plan.name === "Lifetime"
                        ? `$${plan.monthlyPrice}`
                        : plan.name === "Free"
                          ? "$0"
                          : `$${isYearly ? plan.yearlyPrice : plan.monthlyPrice}`}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {plan.name === "Lifetime"
                        ? "One-time payment"
                        : "Mỗi tháng"}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div>
                    <Button
                      className={cn(
                        "w-full cursor-pointer my-2",
                        plan.popular
                          ? "shadow-md border-[0.5px] border-primary-foreground/25 shadow-black/20 bg-primary ring-1 ring-primary/15 text-primary-foreground hover:bg-primary/90"
                          : "shadow-sm shadow-black/15 border border-transparent bg-background ring-1 ring-foreground/10 hover:bg-muted/50"
                      )}
                      variant={plan.popular ? "default" : "secondary"}
                    >
                      {plan.cta}
                    </Button>
                  </div>

                  {/* Features */}
                  <div>
                    <ul role="list" className="flex flex-col gap-3 text-sm">
                      {plan.includesPrevious && (
                        <li className="flex items-center gap-3 font-medium">
                          {plan.includesPrevious}:
                        </li>
                      )}
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center gap-3"
                        >
                          <Check
                            className="text-muted-foreground size-4 flex-shrink-0"
                            strokeWidth={2.5}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enterprise Note */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Bạn cần thành phần tùy chỉnh hoặc có thắc mắc?{" "}
            <Button
              variant="link"
              className="p-0 h-auto cursor-pointer"
              nativeButton={false}
              render={<a href="#contact" />}
            >
              Liên hệ đội ngũ của chúng tôi
            </Button>
          </p>
        </div>
      </div>
    </section>
  )
}
