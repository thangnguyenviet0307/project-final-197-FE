import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { ThemeProvider } from "@/context/theme-provider"
import { SidebarConfigProvider } from "@/context/sidebar-context"
import { Toaster } from "@/components/ui/toast"
import { RootLayout } from "@/layout/root-layout"
import { RouteFallback, isStorefrontRoute } from "@/router/route-fallback"
import { routes } from "@/router/routes"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/services/query-client"
import { AuthBootstrap } from "@/router/auth-bootstrap"
import { configureAuthArea } from "@/stores/auth.store"
import { AuthAreaBoundary } from "@/router/auth-area-boundary"
import { useEffect } from "react"
import { initGTM } from "@/utils/analytics"

// Get basename from environment (for deployment) or use empty string for development
const basename = import.meta.env.VITE_BASENAME || ""

const router = createBrowserRouter(
  [
    {
      element: <AuthAreaBoundary><RootLayout /></AuthAreaBoundary>,
      HydrateFallback: RouteFallback,
      children: routes,
    },
  ],
  { basename }
)

configureAuthArea(isStorefrontRoute(router.state.location.pathname, basename || "/") ? "storefront" : "admin")

function App() {
  // Initialize GTM on app load
  useEffect(() => {
    initGTM()
  }, [])

  return (
    <div
      className="font-sans antialiased"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <SidebarConfigProvider>
          <Toaster>
            <QueryClientProvider client={queryClient}>
              <AuthBootstrap storefront={isStorefrontRoute(router.state.location.pathname, basename || "/")}><RouterProvider router={router} /></AuthBootstrap>
            </QueryClientProvider>
          </Toaster>
        </SidebarConfigProvider>
      </ThemeProvider>
    </div>
  )
}

export default App
