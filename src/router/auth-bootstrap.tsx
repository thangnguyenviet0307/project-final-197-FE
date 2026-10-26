import type { ReactNode } from "react"
import { useAuthSession } from "@/features/auth/hooks/use-auth-session"
import { RootFallback } from "@/layout/root-layout"
import { Button } from "@/components/ui/button"

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const { loading, error, retry, clear } = useAuthSession()
  if (loading) return <RootFallback />
  if (error) return <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
    <p role="alert">{error}</p>
    <Button onClick={() => void retry()}>Thử lại</Button>
    <Button variant="outline" onClick={clear}>Quay lại đăng nhập</Button>
  </div>
  return children
}
