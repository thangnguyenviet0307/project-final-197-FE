import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { clearAuth } from "@/services/api"
import { initializeSession } from "@/features/auth/services/auth.service"

export function useAuthSession() {
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
  return { loading, error, retry: initializeSession, clear: clearAuth }
}
