import { Outlet, useNavigation } from "react-router-dom"

import { StoreSkeleton } from "@/layout/storefront/store-skeleton"
import { PageSkeleton } from "@/components/page-skeleton"

/** Thin top bar shown while the next route's code is loading. */
function RouteProgress() {
  return (
    <div
      role="progressbar"
      aria-label="Đang tải trang"
      className="route-progress fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-primary/15"
    >
      <div className="route-progress-bar h-full w-1/3 bg-primary" />
    </div>
  )
}

export function RootLayout() {
  const navigation = useNavigation()
  return (
    <>
      {navigation.state === "loading" && <RouteProgress />}
      <Outlet />
    </>
  )
}

/** Shown on the very first load, before any route has rendered. */
export function RootFallback({ storefront = true }: { storefront?: boolean }) {
  return storefront ? <StoreSkeleton /> : <PageSkeleton />
}
