
"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Pencil } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import type {
  IBrand,
  CreateBrandInput,
} from "@/app/brands/type"

const brandFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên thương hiệu")
    .max(
      100,
      "Tên thương hiệu không được vượt quá 100 ký tự"
    )
    .regex(
      /^\p{L}/u,
      "Tên thương hiệu phải bắt đầu bằng chữ cái"
    ),

  description: z
    .string()
    .max(
      500,
      "Mô tả không được vượt quá 500 ký tự"
    ),
})

type BrandFormValues = z.infer<typeof brandFormSchema>

interface BrandFormDialogProps {
  brand?: IBrand | null
  onSubmit: (
    values: CreateBrandInput
  ) => Promise<void> | void
  submitLabel?: string
}

export function BrandFormDialog({
  brand,
  onSubmit,
  submitLabel,
}: BrandFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const description = form.watch("description")

  useEffect(() => {
    if (!open) return

    form.reset({
      name: brand?.name ?? "",
      description: brand?.description ?? "",
    })
  }, [brand, open, form])

  const handleOpenChange = (value: boolean) => {
    if (!saving) {
      setOpen(value)
    }
  }

  async function handleSubmit(
    values: BrandFormValues
  ) {
    setSaving(true)
    form.clearErrors("root")

    try {
      await onSubmit({
        name: values.name.trim(),
        description: values.description.trim(),
      })

      setOpen(false)
      form.reset()
    } catch (error: unknown) {
      let message =
        "Không thể lưu thương hiệu. Vui lòng thử lại."

      if (axios.isAxiosError(error)) {
        const status = error.response?.status

        const serverMessage = String(
          error.response?.data?.message ?? ""
        )

        if (
          status === 409 ||
          /duplicate|already exists|đã tồn tại|trùng|E11000/i.test(
            serverMessage
          )
        ) {
          message =
            `Thương hiệu "${values.name.trim()}" đã tồn tại. Vui lòng nhập tên khác.`
        } else if (
          status === 400 ||
          status === 422
        ) {
          message =
            serverMessage ||
            "Thông tin thương hiệu không hợp lệ."
        } else if (
          status === 401 ||
          status === 403
        ) {
          message =
            "Bạn không có quyền thực hiện thao tác này."
        } else if (!error.response) {
          message =
            "Không thể kết nối Backend. Vui lòng kiểm tra server."
        } else {
          message = serverMessage || message
        }
      }

      form.setError("root", { message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {brand ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={() => setOpen(true)}
          aria-label={`Edit ${brand.name}`}
        >
          <Pencil className="size-4" />
        </Button>
      ) : (
        <Button
          type="button"
          className="cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <Plus className="mr-2 size-4" />
          Add Brand
        </Button>
      )}

      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
      >
        <DialogContent
          className="sm:max-w-xl"
          showCloseButton={!saving}
        >
          <DialogHeader>
            <DialogTitle>
              {brand
                ? "Edit Brand"
                : "Add New Brand"}
            </DialogTitle>

            <DialogDescription>
              {brand
                ? "Update brand details below."
                : "Create a new brand for your catalog."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            noValidate
          >
            <Field
              data-invalid={
                !!form.formState.errors.name
              }
            >
              <FieldLabel htmlFor="brand-name">
                Brand Name
              </FieldLabel>

              <Input
                id="brand-name"
                placeholder="Enter brand name"
                disabled={saving}
                aria-invalid={
                  !!form.formState.errors.name
                }
                {...form.register("name")}
              />

              <FieldError
                errors={[
                  form.formState.errors.name,
                ]}
              />
            </Field>

            <Field
              data-invalid={
                !!form.formState.errors.description
              }
            >
              <FieldLabel htmlFor="brand-description">
                Description
              </FieldLabel>

              <Textarea
                id="brand-description"
                placeholder="Enter brand description"
                className="min-h-24"
                maxLength={500}
                disabled={saving}
                aria-invalid={
                  !!form.formState.errors.description
                }
                {...form.register("description")}
              />

              <p className="text-right text-xs text-muted-foreground">
                {description?.length ?? 0}/500 characters
              </p>

              <FieldError
                errors={[
                  form.formState.errors.description,
                ]}
              />
            </Field>

            {form.formState.errors.root && (
              <FieldError
                errors={[
                  form.formState.errors.root,
                ]}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
                className="cursor-pointer"
              >
                {saving
                  ? "Saving..."
                  : submitLabel ??
                    (brand
                      ? "Save Changes"
                      : "Create Brand")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
