import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { BaseLayout } from "@/layout/admin/base-layout"
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from "@/features/customers/hooks/use-customers"
import { CustomerTable } from "@/features/customers/components/data-table"
import { Button } from "@/components/ui/button"
import { getApiError } from "@/services/api"
import type { CreateCustomerInput } from "@/features/customers/types/customers"

export default function CustomersPage() {
  const [params, setParams] = useSearchParams()
  const requestedPage = Number(params.get("page"))
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const search = params.get("search")?.trim() ?? ""
  const [success, setSuccess] = useState("")
  const query = useCustomers({ page, search })
  const create = useCreateCustomer()
  const update = useUpdateCustomer()
  const remove = useDeleteCustomer()
  function changePage(next: number) {
    setParams(previous => { const nextParams = new URLSearchParams(previous); nextParams.set("page", String(next)); return nextParams })
  }
  return <BaseLayout title="Khách hàng" description="Quản lý hồ sơ liên hệ khách hàng. Tài khoản đăng nhập khách hàng hiện chưa khả dụng.">
    <div className="space-y-4 px-4 lg:px-6">
      {success && <p role="status">{success}</p>}
      {query.isPending ? <p role="status">Đang tải khách hàng...</p> : query.isError ? <div role="alert"><p>{getApiError(query.error).message}</p><Button variant="outline" onClick={() => void query.refetch()}>Tải lại khách hàng</Button></div> : <CustomerTable
        customers={query.data.data}
        searchQuery={search}
        page={page}
        total={query.data.pagination.total}
        totalPages={Math.max(1, query.data.pagination.totalPages)}
        onPageChange={changePage}
        onSearch={value => setParams(previous => { const next = new URLSearchParams(previous); if (value.trim()) next.set("search", value.trim()); else next.delete("search"); next.set("page", "1"); return next })}
        onAdd={async (values: CreateCustomerInput) => { setSuccess(""); await create.mutateAsync(values); setSuccess("Đã tạo khách hàng.") }}
        onEdit={async (id, values) => { setSuccess(""); await update.mutateAsync({ id, values }); setSuccess("Đã cập nhật khách hàng.") }}
        onDelete={async id => { setSuccess(""); await remove.mutateAsync(id); setSuccess("Đã xóa khách hàng."); if (query.data.data.length === 1 && page > 1) changePage(page - 1) }}
      />}
    </div>
  </BaseLayout>
}
