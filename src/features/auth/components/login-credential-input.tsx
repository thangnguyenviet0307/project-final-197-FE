import { useEffect, useState, type ComponentProps } from "react"
import { Input } from "@/components/ui/input"

type LoginCredentialInputProps = ComponentProps<typeof Input> & {
  area: "admin" | "customer"
  credential: "email" | "password"
}

// Browsers can ignore autocomplete=off on password forms. Separate HTML names
// and keep fields readonly until direct interaction; switching tabs locks them
// again without discarding the user's own draft.
export function LoginCredentialInput({ area, credential, onPointerDown, onKeyDown, ...props }: LoginCredentialInputProps) {
  const [editable, setEditable] = useState(false)
  useEffect(() => {
    const lock = () => setEditable(false)
    const onVisibility = () => { if (document.hidden) lock() }
    window.addEventListener("blur", lock)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      window.removeEventListener("blur", lock)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])
  return <Input {...props} name={`${area}-sign-in-${credential}`} autoComplete="off" readOnly={!editable}
    onPointerDown={event => { setEditable(true); onPointerDown?.(event) }}
    onKeyDown={event => {
      if (event.key.length === 1 || event.key === "Backspace" || event.key === "Delete") setEditable(true)
      onKeyDown?.(event)
    }}
  />
}
