import type { User } from "@/features/auth/types/auth"
import type { ProfileValues } from "@/features/profile/schemas/profile-schema"
export function valuesFromUser(user: User | null): ProfileValues {
  return { ...(user?.accountType === "customer" ? { address: user.address ?? { street: "", city: "", state: "" } } : {}), firstName: user?.firstName ?? "", lastName: user?.lastName ?? "", personalEmail: user?.personalEmail ?? "", phone: user?.phone ?? "", location: user?.location ?? "", bio: user?.bio ?? "" }
}
