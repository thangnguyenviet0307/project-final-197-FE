import type { User } from "@/features/auth/types/auth"

export function authRedirect(user: Pick<User, "role" | "mustChangePassword" | "accountType">): string {
  if (user.mustChangePassword) {
    return user.accountType === "customer" ? "/account/change-password" : "/auth/change-password"
  }
  return user.accountType === "customer" ? "/" : "/auth/dashboard"
}
