import { Navigate, useSearchParams } from "react-router-dom"
import { CustomerAuthForm } from "@/features/auth/components/customer-auth-form"

export default function MemberPage() {
  const [params] = useSearchParams()
  const action = params.get("act")
  if (action !== "login" && action !== "register") return <Navigate to="/thanh-vien?act=login" replace />
  return <CustomerAuthForm key={action} registration={action === "register"} />
}
