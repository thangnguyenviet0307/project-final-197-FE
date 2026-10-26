import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useChangePassword } from "@/features/auth/hooks/use-change-password"
import { Check, LoaderCircle } from "lucide-react"
import { Link } from "react-router-dom"
import type { z } from "zod"
import { changePasswordSchema } from "@/features/auth/schemas/auth-schemas"
import { getApiError } from "@/services/api"
import { useAuthStore } from "@/stores/auth.store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { LogoutButton } from "@/features/auth/components/logout-button"

type Values = z.infer<typeof changePasswordSchema>
export function ChangePasswordForm({ storefront = false }: { storefront?: boolean }) {
  const required = useAuthStore((state) => state.user?.mustChangePassword)
  const form = useForm<Values>({ resolver: zodResolver(changePasswordSchema), defaultValues: {
    currentPassword: "", newPassword: "", confirmPassword: "",
  } })
  const mutation = useChangePassword((error) => form.setError("root", { message: getApiError(error).message }), storefront ? "/account/login" : "/login")
  return <div className="bg-muted flex min-h-svh items-center justify-center p-6">
    <Card className="w-full max-w-md">
      <CardHeader><CardTitle>Đổi mật khẩu</CardTitle><CardDescription>
        {required ? "Đổi mật khẩu tạm thời do quản trị viên cung cấp để tiếp tục." : "Đổi mật khẩu sẽ kết thúc tất cả các phiên đăng nhập hiện có."}
      </CardDescription></CardHeader>
      <CardContent><form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
        {([
          ["currentPassword", "Mật khẩu hiện tại", "current-password"],
          ["newPassword", "Mật khẩu mới", "new-password"],
          ["confirmPassword", "Nhập lại mật khẩu mới", "new-password"],
        ] as const).map(([name, label, autocomplete]) => <Field key={name} data-invalid={!!form.formState.errors[name]}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input id={name} type="password" autoComplete={autocomplete} aria-invalid={!!form.formState.errors[name]} {...form.register(name)} />
          <FieldError errors={[form.formState.errors[name]]} />
        </Field>)}
        <p className="text-xs text-muted-foreground">Mật khẩu mới cần ít nhất 6 ký tự, gồm chữ in hoa, chữ số và ký tự đặc biệt.</p>
        <ul className="space-y-2 text-sm text-muted-foreground" aria-label="Password requirements">
          {[
            "Password must contain at least 6 characters.",
            "Include at least one uppercase letter and one number.",
            "Include at least one special character, for example: !@#$%^&*()_",
          ].map(requirement => <li key={requirement} className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{requirement}</span>
          </li>)}
        </ul>
        {form.formState.errors.root && <p role="alert" className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending && <LoaderCircle className="animate-spin" />}Lưu mật khẩu mới</Button>
      </form>
      <div className="mt-5 flex items-center justify-between gap-3">
        {!required && <Link className="text-sm underline" to={storefront ? "/account/profile" : "/admin/dashboard"}>{storefront ? "Về hồ sơ" : "Về bảng điều khiển"}</Link>}
        <LogoutButton redirectTo={storefront ? "/account/login" : "/login"} />
      </div></CardContent>
    </Card>
  </div>
}
