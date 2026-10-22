import { Outlet, useMatches, useNavigation } from "react-router-dom"

import { AuthBootstrap } from "@/router/auth-bootstrap"

/** Thin top bar shown while the next route's code is loading. */
function RouteProgress() {
  return (
    <div
      role="progressbar"
      aria-label="Loading page"
      className="route-progress fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-primary/15"
    >
      <div className="route-progress-bar h-full w-1/3 bg-primary" />
    </div>
  )
}

export function RootLayout() {
  const navigation = useNavigation()
  const isStorefront = useMatches().some(match =>
    (match.handle as { storefront?: boolean } | undefined)?.storefront === true
  )
  return (
    <>
      {navigation.state === "loading" && <RouteProgress />}
      {isStorefront ? <Outlet /> : <AuthBootstrap><Outlet /></AuthBootstrap>}
    </>
  )
}

/** Route modules may still be loading; the destination layout is not known yet. */
export function RootFallback() {
  return <RouteProgress />
}
