
"use client"

import { useEffect, useId, useState } from "react"
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

import type {
  ICustomer,
  CreateCustomerInput,
} from "@/features/customers/types/customers"

const customerFormSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên")
    .max(50, "Tên không được vượt quá 50 ký tự"),

  last_name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập họ")
    .max(50, "Họ không được vượt quá 50 ký tự"),

  phone: z
    .string()
    .trim()
    .regex(
      /^0[0-9]{9}$/,
      "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0"
    ),

  email: z
    .string()
    .trim()
    .check(z.email("Email không đúng định dạng"))
    .max(150, "Email không được vượt quá 150 ký tự"),


  street: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập địa chỉ")
    .max(255, "Địa chỉ không được vượt quá 255 ký tự"),

  city: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập thành phố")
    .max(50, "Thành phố không được vượt quá 50 ký tự"),

  state: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tỉnh/thành")
    .max(50, "Tỉnh/thành không được vượt quá 50 ký tự"),


})

type CustomerFormValues = z.infer<
  typeof customerFormSchema
>

interface CustomerFormDialogProps {
  customer?: ICustomer | null
  onSubmit: (
    values: CreateCustomerInput
  ) => Promise<void> | void
  submitLabel?: string
}

export function CustomerFormDialog({
  customer,
  onSubmit,
  submitLabel,
}: CustomerFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const formId = useId()

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      street: "",
      city: "",
      state: "",
    },
  })

  useEffect(() => {
    if (!open) return

    form.reset({
      first_name: customer?.first_name ?? "",
      last_name: customer?.last_name ?? "",
      phone: customer?.phone ?? "",
      email: customer?.email ?? "",
      street: customer?.street ?? "",
      city: customer?.city ?? "",
      state: customer?.state ?? "",
    })
  }, [customer, open, form])

  const handleOpenChange = (value: boolean) => {
    if (!saving) {
      setOpen(value)
    }
  }

  async function handleSubmit(
    values: CustomerFormValues
  ) {
    setSaving(true)
    form.clearErrors("root")

    try {
      const data: CreateCustomerInput = {
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        street: values.street.trim(),
        city: values.city.trim(),
        state: values.state.trim(),
      }

      await onSubmit(data)

      setOpen(false)
      form.reset()
    } catch (error: unknown) {
      let message =
        "Không thể lưu khách hàng. Vui lòng thử lại."

      if (axios.isAxiosError(error)) {
        const status = error.response?.status

        const serverMessage = String(
          error.response?.data?.message ?? ""
        )

        const duplicate =
          status === 409 ||
          /E11000|duplicate|already exists|đã tồn tại/i.test(
            serverMessage
          )

        if (duplicate) {
          if (/email/i.test(serverMessage)) {
            message = "Email này đã được sử dụng."
          } else if (
            /phone|số điện thoại/i.test(serverMessage)
          ) {
            message =
              "Số điện thoại này đã được sử dụng."
          } else {
            message =
              "Thông tin khách hàng đã tồn tại."
          }
        } else if (
          status === 400 ||
          status === 422
        ) {
          message =
            serverMessage ||
            "Thông tin khách hàng không hợp lệ."
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

  const errors = form.formState.errors

  return (
    <>
      {customer ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={() => setOpen(true)}
          aria-label={`Edit ${customer.first_name} ${customer.last_name}`}
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
          Add Customer
        </Button>
      )}

      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
      >
        <DialogContent
          className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
          showCloseButton={!saving}
        >
          <DialogHeader>
            <DialogTitle>
              {customer
                ? "Edit Customer"
                : "Add New Customer"}
            </DialogTitle>

            <DialogDescription>
              {customer
                ? "Update customer information below."
                : "Create a customer contact record. This does not create a sign-in account."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.first_name}>
                <FieldLabel
                  htmlFor={`${formId}-first-name`}
                >
                  First Name
                </FieldLabel>

                <Input
                  id={`${formId}-first-name`}
                  placeholder="First name"
                  disabled={saving}
                  aria-invalid={!!errors.first_name}
                  {...form.register("first_name")}
                />

                <FieldError
                  errors={[errors.first_name]}
                />
              </Field>

              <Field data-invalid={!!errors.last_name}>
                <FieldLabel
                  htmlFor={`${formId}-last-name`}
                >
                  Last Name
                </FieldLabel>

                <Input
                  id={`${formId}-last-name`}
                  placeholder="Last name"
                  disabled={saving}
                  aria-invalid={!!errors.last_name}
                  {...form.register("last_name")}
                />

                <FieldError
                  errors={[errors.last_name]}
                />
              </Field>
            </div>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor={`${formId}-email`}>
                Email
              </FieldLabel>

              <Input
                id={`${formId}-email`}
                type="email"
                placeholder="Email"
                disabled={saving}
                aria-invalid={!!errors.email}
                {...form.register("email")}
              />

              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor={`${formId}-phone`}>
                Phone
              </FieldLabel>

              <Input
                id={`${formId}-phone`}
                type="tel"
                placeholder="Phone number"
                disabled={saving}
                aria-invalid={!!errors.phone}
                {...form.register("phone")}
              />

              <FieldError errors={[errors.phone]} />
            </Field>

            <Field data-invalid={!!errors.street}>
              <FieldLabel htmlFor={`${formId}-street`}>
                Street
              </FieldLabel>

              <Input
                id={`${formId}-street`}
                placeholder="Street address"
                disabled={saving}
                aria-invalid={!!errors.street}
                {...form.register("street")}
              />

              <FieldError errors={[errors.street]} />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.city}>
                <FieldLabel htmlFor={`${formId}-city`}>
                  City
                </FieldLabel>

                <Input
                  id={`${formId}-city`}
                  placeholder="City"
                  disabled={saving}
                  aria-invalid={!!errors.city}
                  {...form.register("city")}
                />

                <FieldError errors={[errors.city]} />
              </Field>

              <Field data-invalid={!!errors.state}>
                <FieldLabel htmlFor={`${formId}-state`}>
                  State
                </FieldLabel>

                <Input
                  id={`${formId}-state`}
                  placeholder="State"
                  disabled={saving}
                  aria-invalid={!!errors.state}
                  {...form.register("state")}
                />

                <FieldError errors={[errors.state]} />
              </Field>
            </div>

            {errors.root && (
              <FieldError errors={[errors.root]} />
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
                    (customer
                      ? "Save Changes"
                      : "Create Customer")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
