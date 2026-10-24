import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { customersService } from "@/features/customers/services/customers.service"
import type { UpdateCustomerInput } from "@/features/customers/types/customers"

export function useCustomers({ page, search }: { page: number; search: string }) {
  return useQuery({
    queryKey: ["customers", { page, search }],
    queryFn: ({ signal }) => customersService.getCustomers({ page, limit: 10, ...(search ? { search } : {}) }, signal),
  })
}

export function useCreateCustomer() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: customersService.createCustomer,
    onSuccess: () => client.invalidateQueries({ queryKey: ["customers"] }),
  })
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
