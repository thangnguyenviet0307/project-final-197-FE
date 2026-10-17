import { useQuery } from "@tanstack/react-query"
import { listUsers } from "@/services/users.service"

export function useUsers(page: number) {
  return useQuery({ queryKey: ["users", page], queryFn: ({ signal }) => listUsers(page, signal) })
}
