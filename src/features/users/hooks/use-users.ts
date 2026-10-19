import { useQuery } from "@tanstack/react-query"
import { listUsers, type UsersFilters } from "@/features/users/services/users.service"

export function useUsers(page: number, search = "", limit = 10, filters: UsersFilters = {}) {
  return useQuery({
    queryKey: ["users", page, search, limit, filters],
    queryFn: ({ signal }) => listUsers(page, signal, search, limit, filters),
    placeholderData: (previousData) => previousData,
  })
}
