import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { ThemeProvider } from "@/context/theme-provider"
import { SidebarConfigProvider } from "@/context/sidebar-context"
import { Toaster } from "@/components/ui/toast"
import { RootFallback, RootLayout } from "@/layout/root-layout"
import { routes } from "@/router/routes"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/services/query-client"
import { useEffect } from "react"
import { initGTM } from "@/utils/analytics"

// Get basename from environment (for deployment) or use empty string for development
const basename = import.meta.env.VITE_BASENAME || ""

const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      HydrateFallback: RootFallback,
      children: routes,
    },
  ],
  { basename }
)

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
              <RouterProvider router={router} />
            </QueryClientProvider>
          </Toaster>
        </SidebarConfigProvider>
      </ThemeProvider>
    </div>
  )
}

export default App
