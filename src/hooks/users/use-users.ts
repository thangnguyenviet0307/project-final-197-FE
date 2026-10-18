import { useQuery } from "@tanstack/react-query"
import { listUsers } from "@/services/users.service"

export function useUsers(page: number, search = "") {
  return useQuery({
    queryKey: ["users", page, search],
    queryFn: ({ signal }) => listUsers(page, signal, search),
    placeholderData: (previousData) => previousData,
  })
}
