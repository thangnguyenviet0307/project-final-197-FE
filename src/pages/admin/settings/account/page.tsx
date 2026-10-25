"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { BaseLayout } from "@/layout/admin/base-layout"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const accountFormSchema = z.object({
  firstName: z.string().min(1, "Vui lòng nhập tên"),
  lastName: z.string().min(1, "Vui lòng nhập họ"),
  email: z.string().email("Địa chỉ email không hợp lệ"),
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

export default function AccountSettings() {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  function onSubmit(data: AccountFormValues) {
    console.log("Form submitted:", data)
    // Here you would typically save the data
  }

  return (
    <BaseLayout>
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        <div>
          <h1 className="text-3xl font-bold">Cài đặt tài khoản</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin và tùy chọn tài khoản.
          </p>
        </div>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>
                Cập nhật thông tin cá nhân hiển thị trên hồ sơ.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FieldGroup className="grid grid-cols-2 gap-4">
                <Controller
                  control={form.control}
                  name="firstName"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="account-first-name">
                        Tên
                      </FieldLabel>

                      <Input
                        id="account-first-name"
                        aria-invalid={fieldState.invalid}
                        placeholder="Nhập tên của bạn"
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
                      <FieldLabel htmlFor="account-last-name">
                        Họ
                      </FieldLabel>

                      <Input
                        id="account-last-name"
                        aria-invalid={fieldState.invalid}
                        placeholder="Nhập họ của bạn"
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="account-email">
                      Địa chỉ email
                    </FieldLabel>

                    <Input
                      id="account-email"
                      aria-invalid={fieldState.invalid}
                      type="email"
                      placeholder="Nhập địa chỉ email"
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
                name="username"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="account-username">Tên đăng nhập</FieldLabel>

                    <Input
                      id="account-username"
                      aria-invalid={fieldState.invalid}
                      placeholder="Nhập tên đăng nhập"
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
              <CardDescription>
                Cập nhật mật khẩu để bảo vệ tài khoản.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Controller
                control={form.control}
                name="currentPassword"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="account-current-password">
                      Mật khẩu hiện tại
                    </FieldLabel>

                    <Input
                      id="account-current-password"
                      aria-invalid={fieldState.invalid}
                      type="password"
                      placeholder="Nhập mật khẩu hiện tại"
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
                name="newPassword"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="account-new-password">
                      Mật khẩu mới
                    </FieldLabel>

                    <Input
                      id="account-new-password"
                      aria-invalid={fieldState.invalid}
                      type="password"
                      placeholder="Nhập mật khẩu mới"
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
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="account-confirm-password">
                      Xác nhận mật khẩu mới
                    </FieldLabel>

                    <Input
                      id="account-confirm-password"
                      aria-invalid={fieldState.invalid}
                      type="password"
                      placeholder="Nhập lại mật khẩu mới"
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thao tác nguy hiểm</CardTitle>
              <CardDescription>
                Các thao tác xóa dữ liệu không thể hoàn tác.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Separator />
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div>
                  <h4 className="font-semibold">Xóa tài khoản</h4>
                  <p className="text-sm text-muted-foreground">
                    Xóa vĩnh viễn tài khoản và tất cả dữ liệu liên quan.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  type="button"
                  className="cursor-pointer"
                >
                  Xóa tài khoản
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="submit" className="cursor-pointer">
              Lưu thay đổi
            </Button>
            <Button variant="outline" type="reset" className="cursor-pointer">
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </BaseLayout>
  )
}
