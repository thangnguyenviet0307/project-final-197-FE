import type { ShippingAddressValues } from "@/features/profile/schemas/customer-account-schema"

export type Role = "super_admin" | "admin" | "staff"

export interface User {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  birthDate?: string
  gender?: "" | "male" | "female" | "other"
  shippingAddress?: ShippingAddressValues
  accountType?: "user" | "customer"
  role?: Role
  mustChangePassword: boolean
  personalEmail?: string
  phone?: string
  location?: string
  bio?: string
  address?: { street: string; city: string; state: string }
  avatar?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCustomerInput extends LoginCredentials {
  firstName: string
  lastName: string
}

export interface TokenPair {
  accessToken: string
  refreshToken?: string
}

export interface AuthResponse extends TokenPair {
  user: User
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}
