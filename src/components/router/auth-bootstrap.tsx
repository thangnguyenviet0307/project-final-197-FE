import type { ReactNode } from "react"
import { useAuthSession } from "@/hooks/auth/use-auth-session"
import { RootFallback } from "@/components/router/root-layout"
import { Button } from "@/components/ui/button"

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const { loading, error, retry, clear } = useAuthSession()
  if (loading) return <RootFallback />
  if (error) return <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
    <p role="alert">{error}</p>
    <Button onClick={() => void retry()}>Try again</Button>
    <Button variant="outline" onClick={clear}>Back to sign in</Button>
  </div>
  return children
}
