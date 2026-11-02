import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"

import { StoreHeader } from "./store-header"
import { StoreNavbar } from "./store-navbar"
import { StoreFooter } from "./store-footer"

export function StorefrontHashScroll() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) return

    let observer: MutationObserver | undefined
    let settleTimeout: number | undefined
    const targetId = hash.slice(1)
    const mainContent = document.getElementById("main-content")

    const scrollToTarget = () => {
      const target = document.getElementById(targetId)
      if (!target) return false

      target.scrollIntoView({ behavior: "smooth", block: "start" })
      return true
    }

    const scheduleFinalScroll = () => {
      if (!scrollToTarget()) return

      if (settleTimeout !== undefined) {
        window.clearTimeout(settleTimeout)
      }

      if (mainContent?.querySelector('[role="status"]')) return

      settleTimeout = window.setTimeout(() => {
        if (!mainContent?.querySelector('[role="status"]')) {
          scrollToTarget()
          observer?.disconnect()
        }
      }, 250)
    }

    if (mainContent) {
      observer = new MutationObserver(scheduleFinalScroll)
      observer.observe(mainContent, { childList: true, subtree: true })
    }

    const frame = window.requestAnimationFrame(scheduleFinalScroll)
    const timeout = window.setTimeout(() => observer?.disconnect(), 10000)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timeout)
      if (settleTimeout !== undefined) {
        window.clearTimeout(settleTimeout)
      }
      observer?.disconnect()
    }
  }, [pathname, hash])

  return null
}

export function StoreLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <StorefrontHashScroll />

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
