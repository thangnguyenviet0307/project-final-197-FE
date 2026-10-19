import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { TokenPair, User } from "@/features/auth/types/auth"

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
  version: 1,
  migrate: () => ({ hasSession: false, sessionId: null }),
  partialize: ({ hasSession, sessionId }) => ({ hasSession, sessionId }),
}))
