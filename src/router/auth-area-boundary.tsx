import { useEffect, type ReactNode } from "react"
import { useLocation } from "react-router-dom"
import { getAuthArea } from "@/stores/auth.store"
import { isStorefrontRoute } from "@/router/route-fallback"
import { RootFallback } from "@/layout/root-layout"

export function AuthAreaBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const storefront = isStorefrontRoute(pathname)
  const changed = (storefront ? "storefront" : "admin") !== getAuthArea()
  useEffect(() => {
    if (changed) window.location.reload()
  }, [changed])
  return changed ? <RootFallback storefront={storefront} /> : children
}
