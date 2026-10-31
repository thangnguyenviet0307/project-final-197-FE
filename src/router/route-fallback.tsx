import { useLocation } from "react-router-dom"
import { isStorefrontRoute } from "@/router/route-area"
import { RootFallback } from "@/layout/root-layout"

export function RouteFallback() {
  const { pathname } = useLocation()
  return <RootFallback storefront={isStorefrontRoute(pathname)} />
}
