import { ShieldX } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/auth/logout-button"
import { useAuthStore } from "@/stores/auth.store"

export function ForbiddenError() {
  const user = useAuthStore((state) => state.user)
  return <div className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center gap-5 p-6 text-center">
    <ShieldX className="size-16 text-destructive" />
    <h1 className="text-4xl font-bold">403</h1>
    <h2 className="text-xl font-semibold">Access denied</h2>
    <p className="text-muted-foreground">Your account does not have permission to access this page. Contact your administrator for help.</p>
    <div className="flex flex-wrap justify-center gap-3">
      {user && user.role !== "customer" ? <Button nativeButton={false} render={<Link to="/admin/dashboard" />}>Back to Dashboard</Button>
        : !user && <Button nativeButton={false} render={<Link to="/login" />}>Sign in</Button>}
      {user && <LogoutButton />}
    </div>
  </div>
}
