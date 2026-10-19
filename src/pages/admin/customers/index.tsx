import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"
import { BaseLayout } from "@/layout/admin/base-layout"
import { customersService } from "@/features/customers/services/customers.service"
import { CustomerTable } from "@/features/customers/components/data-table"
import { Button } from "@/components/ui/button"
import { getApiError } from "@/services/api"
import type { CreateCustomerInput, UpdateCustomerInput } from "@/features/customers/types/customers"

export default function CustomersPage() {
  const client = useQueryClient()
  const [params, setParams] = useSearchParams()
  const requestedPage = Number(params.get("page"))
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const search = params.get("search")?.trim() ?? ""
  const [success, setSuccess] = useState("")
  const query = useQuery({
    queryKey: ["customers", { page, search }],
    queryFn: ({ signal }) => customersService.getCustomers({ page, limit: 10, ...(search ? { search } : {}) }, signal),
  })
  const refresh = () => client.invalidateQueries({ queryKey: ["customers"] })
  const create = useMutation({ mutationFn: customersService.createCustomer, onSuccess: refresh })
  const update = useMutation({ mutationFn: ({ id, values }: { id: string; values: UpdateCustomerInput }) => customersService.updateCustomer(id, values), onSuccess: refresh })
  const remove = useMutation({ mutationFn: customersService.deleteCustomer, onSuccess: refresh })
  function changePage(next: number) {
    setParams(previous => { const nextParams = new URLSearchParams(previous); nextParams.set("page", String(next)); return nextParams })
  }
  return <BaseLayout title="Customers" description="Manage customer contact records. Customer sign-in accounts are not available yet.">
    <div className="space-y-4 px-4 lg:px-6">
      {success && <p role="status">{success}</p>}
      {query.isPending ? <p role="status">Loading customers...</p> : query.isError ? <div role="alert"><p>{getApiError(query.error).message}</p><Button variant="outline" onClick={() => void query.refetch()}>Retry customers</Button></div> : <CustomerTable
        customers={query.data.data}
        searchQuery={search}
        page={page}
        total={query.data.pagination.total}
        totalPages={Math.max(1, query.data.pagination.totalPages)}
        onPageChange={changePage}
        onSearch={value => setParams(previous => { const next = new URLSearchParams(previous); if (value.trim()) next.set("search", value.trim()); else next.delete("search"); next.set("page", "1"); return next })}
        onAdd={async (values: CreateCustomerInput) => { setSuccess(""); await create.mutateAsync(values); setSuccess("Customer created.") }}
        onEdit={async (id, values) => { setSuccess(""); await update.mutateAsync({ id, values }); setSuccess("Customer updated.") }}
        onDelete={async id => { setSuccess(""); await remove.mutateAsync(id); setSuccess("Customer deleted."); if (query.data.data.length === 1 && page > 1) changePage(page - 1) }}
      />}
    </div>
  </BaseLayout>
}
