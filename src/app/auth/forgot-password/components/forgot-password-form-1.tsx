import { Link } from "react-router-dom"
import { ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ForgotPasswordForm1({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-6", className)} {...props}>
    <Card><CardHeader className="text-center">
      <ShieldCheck className="mx-auto mb-2 size-8 text-primary" />
      <CardTitle className="text-xl">Forgot password?</CardTitle>
      <CardDescription>Your account is managed by an administrator.</CardDescription>
    </CardHeader><CardContent className="space-y-5 text-sm">
      <p>Contact your administrator with your account email to receive a temporary password. You will need to change it after signing in.</p>
      <Link to="/login" className="block text-center underline underline-offset-4">Back to sign in</Link>
    </CardContent></Card>
  </div>
}
