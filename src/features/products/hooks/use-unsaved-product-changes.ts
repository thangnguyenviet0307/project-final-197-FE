import { useEffect, useRef } from "react"
import { useBlocker } from "react-router-dom"

export function useUnsavedProductChanges(dirty: boolean) {
  const saved = useRef(false)
  const blocker = useBlocker(() => dirty && !saved.current)
  useEffect(() => {
    if (!dirty) return
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (saved.current) return
      event.preventDefault()
    }
    window.addEventListener("beforeunload", beforeUnload)
    return () => window.removeEventListener("beforeunload", beforeUnload)
  }, [dirty])
  return { blocker, allowSavedNavigation: () => { saved.current = true } }
}
