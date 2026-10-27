import { useLocation } from "react-router-dom"

export function useProductListLocation() {
  const { state } = useLocation()
  const returnTo: unknown = state?.returnTo
  return typeof returnTo === "string" && /^\/auth\/products(?:\?|$)/.test(returnTo) ? returnTo : "/auth/products"
}
