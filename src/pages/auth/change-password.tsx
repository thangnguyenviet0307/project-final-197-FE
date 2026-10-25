import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useChangePassword } from "@/features/auth/hooks/use-change-password"
import { LoaderCircle } from "lucide-react"
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
export default function ChangePasswordPage() {
  const required = useAuthStore((state) => state.user?.mustChangePassword)
  const form = useForm<Values>({ resolver: zodResolver(changePasswordSchema), defaultValues: {
    currentPassword: "", newPassword: "", confirmPassword: "",
  } })
  const mutation = useChangePassword((error) => form.setError("root", { message: getApiError(error).message }))
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
        {form.formState.errors.root && <p role="alert" className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending && <LoaderCircle className="animate-spin" />}Lưu mật khẩu mới</Button>
      </form>
      <div className="mt-5 flex items-center justify-between gap-3">
        {!required && <Link className="text-sm underline" to="/admin/dashboard">Về bảng điều khiển</Link>}
        <LogoutButton />
      </div></CardContent>
    </Card>
  </div>
}
