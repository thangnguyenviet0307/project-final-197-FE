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
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark"]),
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  sidebarWidth: z.string().optional(),
  contentWidth: z.string().optional(),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

export default function AppearanceSettings() {
  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: "dark",
      fontFamily: "",
      fontSize: "",
      sidebarWidth: "",
      contentWidth: "",
    },
  })

  function onSubmit(data: AppearanceFormValues) {
    console.log("Form submitted:", data)
    // Here you would typically save the data
  }

  return (
    <BaseLayout>
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        <div>
          <h1 className="text-3xl font-bold">Giao diện</h1>
          <p className="text-muted-foreground">
            Tùy chỉnh giao diện ứng dụng.
          </p>
        </div>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <FieldGroup>
            {/* Theme Section */}
            <Controller
              control={form.control}
              name="theme"
              render={({ field, fieldState }) => (
                <FieldSet data-invalid={fieldState.invalid}>
                  <FieldLegend>Chủ đề</FieldLegend>
                  <RadioGroup
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex gap-4"
                  >
                    <FieldLabel
                      htmlFor="appearance-theme-light"
                      className="cursor-pointer gap-0 rounded-md [&:has([data-checked])>div]:border-primary"
                    >
                      <RadioGroupItem
                        id="appearance-theme-light"
                        value="light"
                        className="sr-only absolute"
                        aria-invalid={fieldState.invalid}
                      />
                      <div className="rounded-md border-2 border-muted p-4 hover:border-accent transition-colors">
                        <div className="flex flex-col gap-2">
                          <div className="size-20 bg-white border rounded-md p-3">
                            <div className="flex flex-col gap-2">
                              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                              <div className="flex gap-2">
                                <div className="size-2 bg-gray-300 rounded-full"></div>
                                <div className="h-2 bg-gray-200 rounded flex-1"></div>
                              </div>
                              <div className="flex gap-2">
                                <div className="size-2 bg-gray-300 rounded-full"></div>
                                <div className="h-2 bg-gray-200 rounded flex-1"></div>
                              </div>
                            </div>
                          </div>
                          <span className="text-sm font-medium">Sáng</span>
                        </div>
                      </div>
                    </FieldLabel>
                    <FieldLabel
                      htmlFor="appearance-theme-dark"
                      className="cursor-pointer gap-0 rounded-md [&:has([data-checked])>div]:border-primary"
                    >
                      <RadioGroupItem
                        id="appearance-theme-dark"
                        value="dark"
                        className="sr-only absolute"
                        aria-invalid={fieldState.invalid}
                      />
                      <div className="rounded-md border-2 border-muted p-4 hover:border-accent transition-colors">
                        <div className="flex flex-col gap-2">
                          <div className="size-20 bg-gray-900 border border-gray-700 rounded-md p-3">
                            <div className="flex flex-col gap-2">
                              <div className="h-2 bg-gray-600 rounded w-3/4"></div>
                              <div className="h-2 bg-gray-600 rounded w-1/2"></div>
                              <div className="flex gap-2">
                                <div className="size-2 bg-gray-500 rounded-full"></div>
                                <div className="h-2 bg-gray-600 rounded flex-1"></div>
                              </div>
                              <div className="flex gap-2">
                                <div className="size-2 bg-gray-500 rounded-full"></div>
                                <div className="h-2 bg-gray-600 rounded flex-1"></div>
                              </div>
                            </div>
                          </div>
                          <span className="text-sm font-medium">Tối</span>
                        </div>
                      </div>
                    </FieldLabel>
                  </RadioGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldSet>
              )}
            />

            <Controller
              control={form.control}
              name="fontFamily"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="appearance-font-family">
                    Phông chữ
                  </FieldLabel>
                  <Select
                    items={{
                      inter: "Inter",
                      roboto: "Roboto",
                      system: "Mặc định hệ thống",
                    }}
                    name={field.name}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger
                      id="appearance-font-family"
                      aria-invalid={fieldState.invalid}
                      className="cursor-pointer"
                    >
                      <SelectValue placeholder="Chọn phông chữ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="inter">Inter</SelectItem>
                        <SelectItem value="roboto">Roboto</SelectItem>
                        <SelectItem value="system">Mặc định hệ thống</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="fontSize"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="appearance-font-size">
                    Cỡ chữ
                  </FieldLabel>
                  <Select
                    items={{ small: "Nhỏ", medium: "Vừa", large: "Lớn" }}
                    name={field.name}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger
                      id="appearance-font-size"
                      aria-invalid={fieldState.invalid}
                      className="cursor-pointer"
                    >
                      <SelectValue placeholder="Chọn cỡ chữ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="small">Nhỏ</SelectItem>
                        <SelectItem value="medium">Vừa</SelectItem>
                        <SelectItem value="large">Lớn</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Layout Section */}
            <Controller
              control={form.control}
              name="sidebarWidth"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="appearance-sidebar-width">
                    Độ rộng thanh bên
                  </FieldLabel>
                  <Select
                    items={{
                      compact: "Gọn",
                      comfortable: "Vừa phải",
                      spacious: "Rộng",
                    }}
                    name={field.name}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger
                      id="appearance-sidebar-width"
                      aria-invalid={fieldState.invalid}
                      className="cursor-pointer"
                    >
                      <SelectValue placeholder="Chọn độ rộng thanh bên" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="compact">Gọn</SelectItem>
                        <SelectItem value="comfortable">Vừa phải</SelectItem>
                        <SelectItem value="spacious">Rộng</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="contentWidth"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="appearance-content-width">
                    Độ rộng nội dung
                  </FieldLabel>
                  <Select
                    items={{
                      fixed: "Cố định",
                      fluid: "Linh hoạt",
                      container: "Khung nội dung",
                    }}
                    name={field.name}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger
                      id="appearance-content-width"
                      aria-invalid={fieldState.invalid}
                      className="cursor-pointer"
                    >
                      <SelectValue placeholder="Chọn độ rộng nội dung" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="fixed">Cố định</SelectItem>
                        <SelectItem value="fluid">Linh hoạt</SelectItem>
                        <SelectItem value="container">Khung nội dung</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="flex gap-2 mt-12">
            <Button type="submit" className="cursor-pointer">
              Lưu tùy chọn
            </Button>
            <Button variant="outline" type="button" className="cursor-pointer">
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </BaseLayout>
  )
}
