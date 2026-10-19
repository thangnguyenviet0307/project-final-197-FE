import { useLogout } from "@/features/auth/hooks/use-logout"
import { LogOut, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const mutation = useLogout()
  return <Button variant="outline" aria-label="Sign out" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
    {mutation.isPending ? <LoaderCircle className="animate-spin" /> : <LogOut />} <span className="hidden sm:inline">Sign out</span>
  </Button>
}
