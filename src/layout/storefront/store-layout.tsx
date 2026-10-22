import { Outlet } from "react-router-dom"

import { StoreHeader } from "./store-header"
import { StoreNavbar } from "./store-navbar"
import { StoreFooter } from "./store-footer"

export function StoreLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      {/* Header */}
      <StoreHeader />

      {/* Navigation */}
      <StoreNavbar />

      {/* Content from other team members */}
      <main id="main-content" className="w-full flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <StoreFooter />
    </div>
  )
}
