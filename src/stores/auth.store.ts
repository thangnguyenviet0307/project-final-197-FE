import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { TokenPair, User } from "@/features/auth/types/auth"

export type AuthArea = "admin" | "storefront"
let authArea: AuthArea = "admin"
let areaConfigured = false
export const getAuthArea = () => authArea
export const authStorageKey = (area = authArea) => area === "admin" ? "admin-auth" : "customer-auth"

interface AuthState {
  sessionId: string | null
  hasSession: boolean
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  sessionVersion: number
  initializationError: string | null
  setSession: (user: User, tokens: TokenPair) => void
  setTokens: (tokens: TokenPair) => void
  clearSession: () => void
}

// Persist only a non-secret session marker. Credentials stay in memory / HttpOnly cookie.
export const useAuthStore = create<AuthState>()(persist((set) => ({
  sessionId: null,
  hasSession: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  sessionVersion: 0,
  initializationError: null,
  setSession: (user, tokens) => set((state) => ({
    ...tokens, refreshToken: tokens.refreshToken ?? null, hasSession: true, sessionId: crypto.randomUUID(), user, isAuthenticated: true, isLoading: false,
    initializationError: null, sessionVersion: state.sessionVersion + 1,
  })),
  setTokens: (tokens) => set({ ...tokens, refreshToken: tokens.refreshToken ?? null }),
  clearSession: () => set((state) => ({
    sessionId: null, hasSession: false, user: null, accessToken: null, refreshToken: null,
    isAuthenticated: false, isLoading: false, initializationError: null,
    sessionVersion: state.sessionVersion + 1,
  })),
}), {
  name: "admin-auth",
  skipHydration: true,
  version: 2,
  migrate: () => ({ hasSession: false, sessionId: null }),
  partialize: ({ hasSession, sessionId }) => ({ hasSession, sessionId }),
}))

// Called before session bootstrap. Crossing areas reloads the document, so access
// tokens and query caches are never reused between the two applications.
export function configureAuthArea(area: AuthArea) {
  if (areaConfigured && area === authArea) return
  let hasSession = false
  let sessionId: string | null = null
  try {
    const saved = JSON.parse(localStorage.getItem(authStorageKey(area)) ?? "null")
    if (saved?.version === 2 && saved.state?.hasSession === true && typeof saved.state.sessionId === "string") {
      hasSession = true
      sessionId = saved.state.sessionId
    }
  } catch {
    // A missing/malformed marker must never restore credentials or identity.
  }
  areaConfigured = true
  authArea = area
  useAuthStore.persist.setOptions({ name: authStorageKey(area) })
  useAuthStore.setState(state => ({
    sessionId, hasSession, user: null, accessToken: null, refreshToken: null,
    isAuthenticated: false, isLoading: true, initializationError: null,
    sessionVersion: state.sessionVersion + 1,
  }))
}
