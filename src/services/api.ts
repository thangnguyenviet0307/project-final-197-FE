import axios from "axios"
import type { InternalAxiosRequestConfig } from "axios"
import { getAuthArea, useAuthStore } from "@/stores/auth.store"
import { queryClient } from "@/services/query-client"
import type { ApiResponse } from "@/types/api"
import type { TokenPair } from "@/features/auth/types/auth"

const baseURL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1").replace(/\/$/, "")
export const api = axios.create({ baseURL, timeout: 15_000, withCredentials: true })
// Auth endpoints use an isolated client so login/refresh errors never recursively refresh.
export const authApi = axios.create({ baseURL, timeout: 15_000, withCredentials: true })

interface AuthRequest extends InternalAxiosRequestConfig {
  retried?: boolean
  sessionVersion?: number
}

export function clearAuth() {
  useAuthStore.getState().clearSession()
  queryClient.clear()
}

let refreshing: { version: number; promise: Promise<string> } | null = null

export function refreshAccessToken(): Promise<string> {
  const { refreshToken, hasSession, sessionVersion } = useAuthStore.getState()
  if (refreshing?.version === sessionVersion) return refreshing.promise
  if (!refreshToken && !hasSession) {
    clearAuth()
    return Promise.reject(new Error("Your session has expired."))
  }
  const area = getAuthArea()
  const request = () => authApi.post<ApiResponse<TokenPair>>(`${area === "storefront" ? "/customer-auth" : "/auth"}/refresh`, {}, { headers: { "X-Auth-Transport": "cookie", "X-Login-Area": area } })
  const promise = (typeof navigator !== "undefined" && navigator.locks ? navigator.locks.request(`${area}-auth-refresh`, request) : request())
    .then(({ data }) => {
      if (useAuthStore.getState().sessionVersion !== sessionVersion) throw new Error("Session changed")
      if (!data.data.accessToken) throw new Error("Invalid token response")
      useAuthStore.getState().setTokens(data.data)
      return data.data.accessToken
    }).catch((error: unknown) => {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined
      if (useAuthStore.getState().sessionVersion === sessionVersion && (
        status === 400 || status === 401 || status === 403 || (error instanceof Error && error.message === "Invalid token response")
      )) clearAuth()
      throw error
    }).finally(() => {
      if (refreshing?.promise === promise) refreshing = null
    })
  refreshing = { version: sessionVersion, promise }
  return promise
}

api.interceptors.request.use((config: AuthRequest) => {
  const { accessToken, sessionVersion } = useAuthStore.getState()
  if (config.sessionVersion !== undefined && config.sessionVersion !== sessionVersion) {
    throw new axios.CanceledError("Session changed")
  }
  config.sessionVersion = sessionVersion
  config.headers.set("X-Login-Area", getAuthArea())
  if (accessToken) config.headers.set("Authorization", `Bearer ${accessToken}`)
  else config.headers.delete("Authorization")
  return config
})

api.interceptors.response.use((response) => response, async (error: unknown) => {
  if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) throw error
  const config = error.config as AuthRequest
  const state = useAuthStore.getState()
  if (config.sessionVersion !== state.sessionVersion) throw error
  if (config.retried) {
    clearAuth()
    throw error
  }
  config.retried = true
  // A late 401 may belong to the token that another request has already refreshed.
  if (!state.accessToken || config.headers.get("Authorization") === `Bearer ${state.accessToken}`) {
    await refreshAccessToken()
  }
  return api(config)
})

export { getApiError } from "@/utils/api-error"
