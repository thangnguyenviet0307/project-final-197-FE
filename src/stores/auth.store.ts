import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { TokenPair, User } from "@/features/auth/types/auth"

interface AuthState {
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

// Persist only credentials. Always obtain the current user/role from /auth/me on reload.
export const useAuthStore = create<AuthState>()(persist((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  sessionVersion: 0,
  initializationError: null,
  setSession: (user, tokens) => set((state) => ({
    ...tokens, user, isAuthenticated: true, isLoading: false,
    initializationError: null, sessionVersion: state.sessionVersion + 1,
  })),
  setTokens: (tokens) => set(tokens),
  clearSession: () => set((state) => ({
    user: null, accessToken: null, refreshToken: null,
    isAuthenticated: false, isLoading: false, initializationError: null,
    sessionVersion: state.sessionVersion + 1,
  })),
}), {
  name: "admin-auth",
  partialize: ({ accessToken, refreshToken }) => ({ accessToken, refreshToken }),
}))
