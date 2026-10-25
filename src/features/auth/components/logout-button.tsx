import { useLogout } from "@/features/auth/hooks/use-logout"
import { LogOut, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LogoutButton({ redirectTo }: { redirectTo?: string }) {
  const mutation = useLogout(redirectTo)
  return <Button variant="outline" aria-label="Đăng xuất" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
    {mutation.isPending ? <LoaderCircle className="animate-spin" /> : <LogOut />} <span className="hidden sm:inline">Đăng xuất</span>
  </Button>
}
