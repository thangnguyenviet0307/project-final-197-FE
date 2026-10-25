"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MessageCircle, BookOpen } from "lucide-react"
import { Github } from "@/components/icons/brand-icons"

const contactFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "Tên phải có ít nhất 2 ký tự.",
  }),
  lastName: z.string().min(2, {
    message: "Họ phải có ít nhất 2 ký tự.",
  }),
  email: z.string().email({
    message: "Vui lòng nhập địa chỉ email hợp lệ.",
  }),
  subject: z.string().min(5, {
    message: "Chủ đề phải có ít nhất 5 ký tự.",
  }),
  message: z.string().min(10, {
    message: "Lời nhắn phải có ít nhất 10 ký tự.",
  }),
})

export function ContactSection() {
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  function onSubmit(values: z.infer<typeof contactFormSchema>) {
    // Here you would typically send the form data to your backend
    console.log(values)
    // You could also show a success message or redirect
    form.reset()
  }

  return (
    <section id="contact" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Liên hệ với chúng tôi
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Bạn cần hỗ trợ hoặc có thắc mắc?
          </h2>
          <p className="text-lg text-muted-foreground">
            Đội ngũ của chúng tôi luôn sẵn sàng giúp bạn sử dụng ShadcnStore hiệu quả. Hãy chọn cách liên hệ phù hợp.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact Options */}
          <div className="flex flex-col gap-6 order-2 lg:order-1">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="size-5 text-primary" />
                  Cộng đồng Discord
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Tham gia cộng đồng để được hỗ trợ và trao đổi với các lập trình viên khác.
                </p>
                <Button
                  variant="outline"
                  size="sm"
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
                  Tham gia Discord
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="size-5 text-primary" />
                  Báo lỗi trên GitHub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Báo lỗi, đề xuất tính năng hoặc đóng góp vào kho mã nguồn mở.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  nativeButton={false}
                  render={
                    <a
                      href="https://github.com/shadcnstore/shadcn-dashboard-landing-template/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  Xem trên GitHub
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-5 text-primary" />
                  Tài liệu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Khám phá hướng dẫn và tài liệu chi tiết về các thành phần.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  nativeButton={false}
                  render={<a href="#" />}
                >
                  Xem tài liệu
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="size-5" />
                  Gửi lời nhắn cho chúng tôi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col gap-6"
                >
                  <FieldGroup className="grid gap-4 sm:grid-cols-2">
                    <Controller
                      control={form.control}
                      name="firstName"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="contact-section-first-name">
                            Nhập tên
                          </FieldLabel>

                          <Input
                            id="contact-section-first-name"
                            aria-invalid={fieldState.invalid}
                            placeholder="John"
                            {...field}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <Controller
                      control={form.control}
                      name="lastName"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="contact-section-last-name">
                            Nhập họ
                          </FieldLabel>

                          <Input
                            id="contact-section-last-name"
                            aria-invalid={fieldState.invalid}
                            placeholder="Doe"
                            {...field}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </FieldGroup>
                  <FieldGroup>
                    <Controller
                      control={form.control}
                      name="email"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="contact-section-email">
                            Email
                          </FieldLabel>

                          <Input
                            id="contact-section-email"
                            aria-invalid={fieldState.invalid}
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <Controller
                      control={form.control}
                      name="subject"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="contact-section-subject">
                            Chủ đề
                          </FieldLabel>

                          <Input
                            id="contact-section-subject"
                            aria-invalid={fieldState.invalid}
                            placeholder="Yêu cầu thành phần, báo lỗi, thắc mắc..."
                            {...field}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <Controller
                      control={form.control}
                      name="message"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="contact-section-message">
                            Lời nhắn
                          </FieldLabel>

                          <Textarea
                            id="contact-section-message"
                            aria-invalid={fieldState.invalid}
                            placeholder="Hãy cho biết bạn cần hỗ trợ gì về các thành phần ShadcnStore..."
                            rows={10}
                            className="min-h-50"
                            {...field}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </FieldGroup>
                  <Button type="submit" className="w-full cursor-pointer">
                    Gửi lời nhắn
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
