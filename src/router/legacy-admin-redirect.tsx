import { Navigate, useLocation } from "react-router-dom"

export function LegacyAdminRedirect() {
  const location = useLocation()
  const pathname = location.pathname.replace(/^\/admin(?=\/)/, "")
  return <Navigate to={`/auth${pathname}${location.search}${location.hash}`} state={location.state} replace />
}
