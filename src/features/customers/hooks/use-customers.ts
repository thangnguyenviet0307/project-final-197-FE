import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { customersService } from "@/features/customers/services/customers.service"
import type { CustomerStatus, UpdateCustomerInput } from "@/features/customers/types/customers"

export function useCustomers({ page, search, status = "all" }: { page: number; search: string; status?: CustomerStatus }) {
  return useQuery({
    queryKey: ["customers", { page, search, status }],
    queryFn: ({ signal }) => customersService.getCustomers({ page, limit: 10, ...(search ? { search } : {}), ...(status !== "all" ? { isActive: status === "active" } : {}) }, signal),
  })
}

export function useCustomerStatistics() {
  return useQueries({ queries: ([undefined, true, false] as const).map(isActive => ({
    queryKey: ["customers", "statistics", isActive ?? "all"],
    queryFn: async ({ signal }: { signal: AbortSignal }) => (await customersService.getCustomers({ page: 1, limit: 1, ...(isActive !== undefined ? { isActive } : {}) }, signal)).pagination.total,
  })) })
}

export function useUpdateCustomer() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateCustomerInput }) => customersService.updateCustomer(id, values),
    onSuccess: () => client.invalidateQueries({ queryKey: ["customers"] }),
  })
}

export function useDeleteCustomer() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: customersService.deleteCustomer,
    onSuccess: () => client.invalidateQueries({ queryKey: ["customers"] }),
  })
}
