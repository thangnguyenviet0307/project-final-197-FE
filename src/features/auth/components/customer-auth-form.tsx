import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useLocation } from "react-router-dom"
import { Eye, EyeOff, LoaderCircle } from "lucide-react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { useLogin } from "@/features/auth/hooks/use-login"
import { useRegisterCustomer } from "@/features/auth/hooks/use-register-customer"
import { customerRegistrationSchema, loginSchema } from "@/features/auth/schemas/auth-schemas"
import { PageLayout } from "@/layout/storefront/page-layout"
import { getApiError } from "@/services/api"

type FormValues = z.infer<typeof customerRegistrationSchema>

export function CustomerAuthForm({ registration = false }: { registration?: boolean }) {
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(registration ? customerRegistrationSchema : loginSchema.extend({
      firstName: z.string(), lastName: z.string(), confirmPassword: z.string(),
    })),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" },
  })
  const handleError = (error: Error) => {
    const failure = getApiError(error)
    form.setError("root", { message: failure.message })
    failure.errors?.forEach(({ field, message }) => {
      if (field === "email" || field === "password" || field === "firstName" || field === "lastName") form.setError(field, { message })
    })
  }
  const loginMutation = useLogin(handleError, true)
  const registerMutation = useRegisterCustomer(handleError)
  const isPending = loginMutation.isPending || registerMutation.isPending
  const title = registration ? "Đăng ký tài khoản" : "Đăng nhập"
  const fields: { name: keyof FormValues; label: string; autoComplete: string; type?: string }[] = [
    ...(registration ? [
      { name: "lastName" as const, label: "Họ", autoComplete: "family-name" },
      { name: "firstName" as const, label: "Tên", autoComplete: "given-name" },
    ] : []),
    { name: "email", label: "Email", autoComplete: "username", type: "email" },
    { name: "password", label: "Mật khẩu", autoComplete: registration ? "new-password" : "current-password", type: "password" },
    ...(registration ? [{ name: "confirmPassword" as const, label: "Xác nhận mật khẩu", autoComplete: "new-password", type: "password" }] : []),
  ]

  return <PageLayout title={title} breadcrumbs={[{ label: title }]}>
    <section className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8" aria-label={title}>
      <h2 className="text-2xl font-bold">{registration ? "Chào mừng đến DEMO STORE" : "Chào mừng bạn trở lại"}</h2>
      <p className="mt-2 mb-6 text-sm text-gray-500">{registration ? "Tạo tài khoản để mua sắm thuận tiện hơn." : "Nhập thông tin tài khoản để tiếp tục mua sắm."}</p>
      {!registration && typeof location.state?.message === "string" && <p role="status" className="mb-5 rounded-lg bg-green-50 p-3 text-sm text-green-800">{location.state.message}</p>}
      <form noValidate className="space-y-4" onSubmit={form.handleSubmit((values) => {
        form.clearErrors("root")
        if (registration) {
          registerMutation.mutate({ email: values.email, password: values.password, firstName: values.firstName, lastName: values.lastName })
          return
        }
        loginMutation.mutate({ email: values.email, password: values.password })
      })}>
        <fieldset disabled={isPending} className="space-y-4">
          {fields.map(({ name, label, autoComplete, type = "text" }) => <Field key={name} data-invalid={!!form.formState.errors[name]}>
            <FieldLabel htmlFor={`customer-${name}`}>{label}</FieldLabel>
            <div className="relative">
              <Input id={`customer-${name}`} type={type === "password" && showPassword ? "text" : type} autoComplete={autoComplete} aria-invalid={!!form.formState.errors[name]} aria-describedby={form.formState.errors[name] ? `customer-${name}-error` : undefined} className={type === "password" ? "pr-12" : undefined} {...form.register(name)} />
              {name === "password" && <button type="button" className="absolute inset-y-0 right-0 px-3 text-gray-500" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
            </div>
            <FieldError id={`customer-${name}-error`} errors={[form.formState.errors[name]]} />
          </Field>)}
        </fieldset>
        {form.formState.errors.root && <p role="alert" className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
        <Button type="submit" disabled={isPending} className="w-full bg-[#55b000] text-white hover:bg-[#459000]">
          {isPending && <LoaderCircle className="animate-spin" />}{isPending ? registration ? "Đang đăng ký…" : "Đang đăng nhập…" : registration ? "Đăng ký" : "Đăng nhập"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">{registration ? "Đã có tài khoản? " : "Chưa có tài khoản? "}<Link className="font-semibold text-[#459000] hover:underline" to={registration ? "/account/login" : "/register"}>{registration ? "Đăng nhập" : "Đăng ký"}</Link></p>
      <Link to="/contact" className="mt-4 block text-center text-sm text-gray-500 hover:underline">Liên hệ hỗ trợ</Link>
    </section>
  </PageLayout>
}
