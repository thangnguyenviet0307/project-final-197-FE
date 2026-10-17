import { z } from "zod"
import { api, authApi, clearAuth, getApiError } from "@/services/api"
import { useAuthStore } from "@/stores/auth.store"
import { queryClient } from "@/lib/query-client"
import type { ApiResponse, ChangePasswordInput, LoginCredentials, TokenPair } from "@/types/auth"
import type { ProfileValues } from "@/lib/profile-schema"

const userSchema = z.object({
  id: z.string().min(1),
  // Legacy accounts may not contain separate first/last name fields.
  firstName: z.string().nullish().transform((value) => value?.trim() ?? ""),
  lastName: z.string().nullish().transform((value) => value?.trim() ?? ""),
  name: z.string().nullish(),
  personalEmail: z.string().nullish().transform((value) => value ?? ""),
  phone: z.string().nullish().transform((value) => value ?? ""),
  location: z.string().nullish().transform((value) => value ?? ""),
  bio: z.string().nullish().transform((value) => value ?? ""),
  avatar: z.string().nullish().transform((value) => value ?? ""),
  email: z.string(), role: z.enum(["admin", "staff", "customer"]),
  mustChangePassword: z.boolean().default(false),
}).transform((user) => ({
  ...user,
  name: `${user.firstName} ${user.lastName}`.trim() || user.name?.trim() || user.email,
}))

export async function login(credentials: LoginCredentials) {
  const version = useAuthStore.getState().sessionVersion
  const { data } = await authApi.post<ApiResponse<TokenPair & { user: unknown }>>("/auth/login", credentials)
  if (useAuthStore.getState().sessionVersion !== version) throw new Error("Session changed")
  const user = userSchema.parse(data.data.user)
  queryClient.clear()
  useAuthStore.getState().setSession(user, data.data)
  return user
}

export async function logout() {
  try {
    await api.post("/auth/logout")
  } finally {
    clearAuth()
  }
}

export async function changePassword(input: ChangePasswordInput) {
  await api.post("/auth/change-password", input)
  clearAuth()
}

export async function updateProfile({ profile, avatar, removeAvatar }: {
  profile: ProfileValues
  avatar: File | null
  removeAvatar: boolean
}) {
  const version = useAuthStore.getState().sessionVersion
  const body = new FormData()
  Object.entries(profile).forEach(([key, value]) => body.append(key, value))
  if (avatar) body.append("avatar", avatar)
  else if (removeAvatar) body.append("avatar", "")
  const { data } = await api.patch<ApiResponse<unknown>>("/auth/me", body)
  if (useAuthStore.getState().sessionVersion !== version) throw new Error("Session changed")
  const user = userSchema.parse(data.data)
  useAuthStore.setState({ user })
  queryClient.setQueryData(["auth", "me", version], user)
  await queryClient.invalidateQueries({ queryKey: ["users"] })
  return user
}

export async function getProfile(signal?: AbortSignal) {
  const { data } = await api.get<ApiResponse<unknown>>("/auth/me", { signal })
  return userSchema.parse(data.data)
}

let initializing: Promise<void> | null = null
export function initializeSession(): Promise<void> {
  if (initializing) return initializing
  const state = useAuthStore.getState()
  if (!state.accessToken && !state.refreshToken) {
    clearAuth()
    return Promise.resolve()
  }
  const version = state.sessionVersion
  useAuthStore.setState({ isLoading: true, initializationError: null })
  initializing = queryClient.fetchQuery({
    queryKey: ["auth", "me", version],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiResponse<unknown>>("/auth/me", { signal })
      return userSchema.parse(data.data)
    },
    staleTime: 0,
  }).then((user) => {
    const current = useAuthStore.getState()
    if (current.sessionVersion === version && current.accessToken && current.refreshToken) {
      current.setSession(user, { accessToken: current.accessToken, refreshToken: current.refreshToken })
    }
  }).catch((error: unknown) => {
    if (useAuthStore.getState().sessionVersion !== version) return
    const failure = getApiError(error)
    if (failure.statusCode === 401 || failure.statusCode === 403) clearAuth()
    else useAuthStore.setState({ isLoading: false, initializationError: failure.message })
  }).finally(() => { initializing = null })
  return initializing
}
