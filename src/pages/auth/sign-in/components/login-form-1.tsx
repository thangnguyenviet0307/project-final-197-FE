import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { useLogin } from "@/features/auth/hooks/use-login"
import { Link, useLocation } from "react-router-dom"
import { LoaderCircle } from "lucide-react"
import { cn } from "@/utils/utils"
import { loginSchema } from "@/features/auth/schemas/auth-schemas"
import { getApiError } from "@/services/api"
import type { LoginCredentials } from "@/features/auth/types/auth"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginCredentialInput } from "@/features/auth/components/login-credential-input"

export function LoginForm1({ className, ...props }: React.ComponentProps<"div">) {
  const location = useLocation()
  const form = useForm<LoginCredentials>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } })
  const mutation = useLogin((error) => {
      const failure = getApiError(error)
      form.setError("root", { message: failure.message })
      failure.errors?.forEach(({ field, message }) => {
        if (field === "email" || field === "password") form.setError(field, { message })
      })
  })
  return <div className={cn("flex flex-col gap-6", className)} {...props}>
    <Card><CardHeader className="text-center">
      <CardTitle className="text-xl">Đăng nhập quản trị</CardTitle>
      <CardDescription>Sử dụng tài khoản do quản trị viên cung cấp.</CardDescription>
    </CardHeader><CardContent>
      {typeof location.state?.message === "string" && <p role="status" className="mb-4 text-sm">{location.state.message}</p>}
      <form name="admin-sign-in" autoComplete="off" className="space-y-4" noValidate onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="login-email">Email</FieldLabel>
          <Controller control={form.control} name="email" render={({ field }) => <LoginCredentialInput {...field} area="admin" credential="email" id="login-email" type="email" placeholder="you@example.com" aria-invalid={!!form.formState.errors.email} />} />
          <FieldError errors={[form.formState.errors.email]} />
        </Field>
        <Field data-invalid={!!form.formState.errors.password}>
          <FieldLabel htmlFor="login-password">Mật khẩu</FieldLabel>
          <Controller control={form.control} name="password" render={({ field }) => <LoginCredentialInput {...field} area="admin" credential="password" id="login-password" type="password" aria-invalid={!!form.formState.errors.password} />} />
          <FieldError errors={[form.formState.errors.password]} />
        </Field>
        {form.formState.errors.root && <p role="alert" className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending && <LoaderCircle className="animate-spin" />} {mutation.isPending ? "Đang đăng nhập…" : "Đăng nhập"}
        </Button>
      </form>
      <div className="mt-4 text-right">
        <Link to="/auth/forgot-password" className="text-sm underline-offset-4 hover:underline">Quên mật khẩu?</Link>
      </div>
    </CardContent></Card>
  </div>
}
