import { matchRoutes, useLocation } from "react-router-dom"
import { routes } from "@/router/routes"
import { RootFallback } from "@/layout/root-layout"

// Match the real route hierarchy so aliases and nested routes inherit their area.
export function isStorefrontRoute(pathname: string, basename = "/"): boolean {
  const matches = matchRoutes(routes, pathname, basename) ?? []
  for (const match of [...matches].reverse()) {
    const handle: unknown = match.route.handle
    if (typeof handle === "object" && handle !== null && "area" in handle) {
      if (handle.area === "admin") return false
      if (handle.area === "storefront") return true
    }
  }
  return true
}

export function RouteFallback() {
  const { pathname } = useLocation()
  return <RootFallback storefront={isStorefrontRoute(pathname)} />
}
