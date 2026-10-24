export type Role = "admin" | "staff" | "customer"

export interface User {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  role: Role
  mustChangePassword: boolean
  personalEmail?: string
  phone?: string
  location?: string
  bio?: string
  avatar?: string
}

export interface LoginCredentials {
  email: string
  password: string
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
