import { useMutation } from "@tanstack/react-query"
import { LogOut, LoaderCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { logout } from "@/services/auth.service"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const navigate = useNavigate()
  const mutation = useMutation({ mutationFn: logout, meta: { successMessage: "Signed out successfully." }, onSettled: () => navigate("/login", { replace: true }) })
  return <Button variant="outline" aria-label="Sign out" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
    {mutation.isPending ? <LoaderCircle className="animate-spin" /> : <LogOut />} <span className="hidden sm:inline">Sign out</span>
  </Button>
}
