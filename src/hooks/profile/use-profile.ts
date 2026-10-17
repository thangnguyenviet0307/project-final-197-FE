import { useQuery } from "@tanstack/react-query"
import { getProfile } from "@/services/auth.service"
import { useAuthStore } from "@/stores/auth.store"

export function useProfile() {
  const version = useAuthStore((state) => state.sessionVersion)
  return useQuery({
    queryKey: ["auth", "me", version],
    queryFn: ({ signal }) => getProfile(signal),
    staleTime: 0,
  })
}
