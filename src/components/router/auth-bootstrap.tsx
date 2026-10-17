import { useEffect, type ReactNode } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { clearAuth } from "@/services/api"
import { initializeSession } from "@/services/auth.service"
import { RootFallback } from "@/components/router/root-layout"
import { Button } from "@/components/ui/button"

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const loading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.initializationError)
  useEffect(() => { void initializeSession() }, [])
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === "admin-auth" || event.key === null) window.location.reload()
    }
    window.addEventListener("storage", sync)
    return () => window.removeEventListener("storage", sync)
  }, [])
  if (loading) return <RootFallback />
  if (error) return <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
    <p role="alert">{error}</p>
    <Button onClick={() => void initializeSession()}>Try again</Button>
    <Button variant="outline" onClick={clearAuth}>Back to sign in</Button>
  </div>
  return children
}
