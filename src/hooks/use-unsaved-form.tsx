import { useContext, useEffect, useRef, useState } from "react"
import { UNSAFE_DataRouterContext } from "react-router-dom"
import { DiscardDialog, RouteGuard } from "@/components/unsaved-changes-guard"

export function useUnsavedForm(dirty: boolean) {
  const router = useContext(UNSAFE_DataRouterContext)
  const saved = useRef(false)
  const [pendingCancel, setPendingCancel] = useState<(() => void) | null>(null)
  useEffect(() => {
    if (!dirty) return
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (saved.current) return
      event.preventDefault()
    }
    window.addEventListener("beforeunload", beforeUnload)
    return () => window.removeEventListener("beforeunload", beforeUnload)
  }, [dirty])
  return {
    allowSavedNavigation: () => { saved.current = true },
    confirmDiscard: (cancel: () => void) => {
      if (dirty && !saved.current) setPendingCancel(() => cancel)
      else cancel()
    },
    guard: <>
      {router && <RouteGuard dirty={dirty} saved={saved} />}
      <DiscardDialog open={pendingCancel !== null} keep={() => setPendingCancel(null)} discard={() => { saved.current = true; setPendingCancel(null); pendingCancel?.() }} />
    </>,
  }
}
