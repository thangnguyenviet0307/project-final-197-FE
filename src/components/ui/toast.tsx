import { useEffect, type CSSProperties, type ReactNode } from "react"
import { Toaster as SonnerToaster, toast, useSonner } from "sonner"
import { useTheme } from "@/hooks/theme/use-theme"

export { toast } from "sonner"

export function Toaster({ children }: { children?: ReactNode }) {
  const { theme } = useTheme()
  const { toasts } = useSonner()
  useEffect(() => {
    // Drop older notifications instead of retaining an unbounded queue during bursts.
    toasts.slice(3).forEach((item) => toast.dismiss(item.id))
  }, [toasts])
  return <>
    {children}
    <SonnerToaster className="app-toaster" position="bottom-left" theme={theme} richColors closeButton={false}
      duration={5000} visibleToasts={3} expand gap={8} offset={16} mobileOffset={16}
      style={{ "--width": "min(280px, calc(100vw - 32px))" } as CSSProperties}
      toastOptions={{ duration: 5000, closeButton: false, style: {
        fontFamily: "inherit", padding: "8px 10px", minHeight: 40, fontSize: 12,
        display: "grid", gridTemplateColumns: "16px minmax(0, 1fr) 16px", columnGap: 6,
        alignItems: "center", textAlign: "center", borderRadius: 10,
      } }} />
  </>
}
