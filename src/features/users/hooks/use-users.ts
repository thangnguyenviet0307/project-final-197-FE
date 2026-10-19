import { useQuery } from "@tanstack/react-query"
import { listUsers } from "@/features/users/services/users.service"

export function useUsers(page: number, search = "", limit = 10) {
  return useQuery({
    queryKey: ["users", page, search, limit],
    queryFn: ({ signal }) => listUsers(page, signal, search, limit),
    placeholderData: (previousData) => previousData,
  })
}
