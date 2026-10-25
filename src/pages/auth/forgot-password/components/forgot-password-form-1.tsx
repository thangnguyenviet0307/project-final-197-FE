import { Link } from "react-router-dom"
import { ShieldCheck } from "lucide-react"
import { cn } from "@/utils/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ForgotPasswordForm1({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-6", className)} {...props}>
    <Card><CardHeader className="text-center">
      <ShieldCheck className="mx-auto mb-2 size-8 text-primary" />
      <CardTitle className="text-xl">Quên mật khẩu?</CardTitle>
      <CardDescription>Tài khoản của bạn do quản trị viên quản lý.</CardDescription>
    </CardHeader><CardContent className="space-y-5 text-sm">
      <p>Liên hệ quản trị viên và cung cấp email tài khoản để nhận mật khẩu tạm thời. Bạn cần đổi mật khẩu sau khi đăng nhập.</p>
      <Link to="/login" className="block text-center underline underline-offset-4">Quay lại đăng nhập</Link>
    </CardContent></Card>
  </div>
}
