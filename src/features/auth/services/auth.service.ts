import { z } from "zod"
import { api, authApi, clearAuth, getApiError, refreshAccessToken } from "@/services/api"
import { getAuthArea, useAuthStore } from "@/stores/auth.store"
import { queryClient } from "@/services/query-client"
import type { ApiResponse } from "@/types/api"
import type { ChangePasswordInput, LoginCredentials, RegisterCustomerInput, TokenPair } from "@/features/auth/types/auth"
import type { ProfileValues } from "@/features/profile/schemas/profile-schema"
import { shippingAddressSchema, type CustomerProfileValues, type ShippingAddressValues } from "@/features/profile/schemas/customer-account-schema"

const userSchema = z.object({
  id: z.string().min(1),
  // Legacy accounts may not contain separate first/last name fields.
  firstName: z.string().nullish().transform((value) => value?.trim() ?? ""),
  lastName: z.string().nullish().transform((value) => value?.trim() ?? ""),
  name: z.string().nullish(),
  birthDate: z.string().optional(),
  gender: z.enum(["", "male", "female", "other"]).optional(),
  shippingAddress: shippingAddressSchema.optional(),
  personalEmail: z.string().nullish().transform((value) => value ?? ""),
  phone: z.string().nullish().transform((value) => value ?? ""),
  location: z.string().nullish().transform((value) => value ?? ""),
  bio: z.string().nullish().transform((value) => value ?? ""),
  avatar: z.string().nullish().transform((value) => value ?? ""),
  email: z.string(), accountType: z.enum(["user", "customer"]).default("user"), role: z.enum(["admin", "staff"]).optional(),
  address: z.object({ street: z.string(), city: z.string(), state: z.string() }).optional(),
  mustChangePassword: z.boolean().default(false),
}).superRefine((user, ctx) => {
  if (user.accountType === "customer" ? user.role !== undefined : user.role === undefined) ctx.addIssue({ code: "custom", message: "Invalid account identity" })
}).transform((user) => ({
  ...user,
  name: `${user.firstName} ${user.lastName}`.trim() || user.name?.trim() || user.email,
}))

const authPath = () => getAuthArea() === "storefront" ? "/customer-auth" : "/auth"

export async function registerCustomer(input: RegisterCustomerInput) {
  const { email, password, firstName, lastName } = input
  await authApi.post<ApiResponse<unknown>>("/customer-auth/register", { email, password, firstName, lastName }, { headers: { "X-Login-Area": "storefront" } })
}

export async function login(credentials: LoginCredentials, storefront = false) {
  const version = useAuthStore.getState().sessionVersion
  const { data } = await authApi.post<ApiResponse<TokenPair & { user: unknown }>>(storefront ? "/customer-auth/login" : "/auth/login", credentials, { headers: { "X-Auth-Transport": "cookie", "X-Login-Area": storefront ? "storefront" : "admin" } })
  if (useAuthStore.getState().sessionVersion !== version) throw new Error("Session changed")
  const user = userSchema.parse(data.data.user)
  if (storefront ? user.accountType !== "customer" : user.accountType === "customer") {
    throw new Error("Tài khoản không tồn tại !")
  }
  queryClient.clear()
  useAuthStore.getState().setSession(user, data.data)
  return user
}

export async function logout() {
  try {
    await api.post(`${authPath()}/logout`)
  } finally {
    clearAuth()
  }
}

export async function changePassword(input: ChangePasswordInput) {
  await api.post(`${authPath()}/change-password`, input)
  clearAuth()
}

export async function updateProfile({ profile, avatar, removeAvatar }: {
  profile: ProfileValues | CustomerProfileValues
  avatar: File | null
  removeAvatar: boolean
}) {
  const version = useAuthStore.getState().sessionVersion
  const body = new FormData()
  Object.entries(profile).forEach(([key, value]) => { if (typeof value === "string") body.append(key, value) })
  if (avatar) body.append("avatar", avatar)
  else if (removeAvatar) body.append("avatar", "")
  const { data } = await api.patch<ApiResponse<unknown>>(`${authPath()}/me`, getAuthArea() === "storefront" ? profile : body)
  if (useAuthStore.getState().sessionVersion !== version) throw new Error("Session changed")
  const user = userSchema.parse(data.data)
  useAuthStore.setState({ user })
  return user
}

export async function getProfile(signal?: AbortSignal) {
  const { data } = await api.get<ApiResponse<unknown>>(`${authPath()}/me`, { signal })
  return userSchema.parse(data.data)
}

export async function updateShippingAddress(input: ShippingAddressValues) {
  const version = useAuthStore.getState().sessionVersion
  const { data } = await api.patch<ApiResponse<unknown>>("/customer-auth/shipping-address", input)
  if (useAuthStore.getState().sessionVersion !== version) throw new Error("Session changed")
  const user = userSchema.parse(data.data)
  useAuthStore.setState({ user })
  return user
}

let initializing: Promise<void> | null = null
export function initializeSession(): Promise<void> {
  if (initializing) return initializing
  const state = useAuthStore.getState()
  if (!state.accessToken && !state.refreshToken && !state.hasSession) {
    clearAuth()
    return Promise.resolve()
  }
  const version = state.sessionVersion
  useAuthStore.setState({ isLoading: true, initializationError: null })
  initializing = (state.accessToken ? Promise.resolve() : refreshAccessToken().then(() => undefined)).then(() => queryClient.fetchQuery({
    queryKey: ["auth", "me", version],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiResponse<unknown>>(`${authPath()}/me`, { signal })
      return userSchema.parse(data.data)
    },
    staleTime: 0,
  })).then((user) => {
    const current = useAuthStore.getState()
    if (current.sessionVersion === version && current.accessToken) {
      if (getAuthArea() === "storefront" ? user.accountType !== "customer" : user.accountType === "customer") { clearAuth(); return }
      useAuthStore.setState({ user, isAuthenticated: true, isLoading: false, initializationError: null })
    }
  }).catch((error: unknown) => {
    if (useAuthStore.getState().sessionVersion !== version) return
    const failure = getApiError(error)
    if (failure.statusCode === 401) clearAuth()
    else useAuthStore.setState({ isLoading: false, initializationError: failure.message })
  }).finally(() => { initializing = null })
  return initializing
}
