import type { User } from "@/features/auth/types/auth"

export function authRedirect(user: Pick<User, "role" | "mustChangePassword">): string {
  if (user.mustChangePassword) {
    return user.role === "customer" ? "/account/change-password" : "/change-password"
  }
  return user.role === "customer" ? "/" : "/admin/dashboard"
}
