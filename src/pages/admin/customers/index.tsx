import { useAuthStore } from "@/stores/auth.store"
import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { BaseLayout } from "@/layout/admin/base-layout"
import { useCustomers, useDeleteCustomer } from "@/features/customers/hooks/use-customers"
import { CustomerTable } from "@/features/customers/components/data-table"
import { CustomerStatistics } from "@/features/customers/components/customer-statistics"
import { ContentSkeleton } from "@/components/page-skeleton"
import { Button } from "@/components/ui/button"
import { getApiError } from "@/services/api"

export default function CustomersPage() {
  const admin = useAuthStore(state => state.user?.role === "admin")
  const [params, setParams] = useSearchParams()
  const requestedPage = Number(params.get("page"))
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const search = params.get("search")?.trim() ?? ""
  const rawStatus = params.get("status")
  const status = rawStatus === "active" || rawStatus === "inactive" ? rawStatus : "all"
  const [success, setSuccess] = useState("")
  const query = useCustomers({ page, search, status })
  const remove = useDeleteCustomer()
  function changePage(next: number) {
    setParams(previous => { const nextParams = new URLSearchParams(previous); nextParams.set("page", String(next)); return nextParams })
  }
  return <BaseLayout title="Khách hàng" description="Quản lý hồ sơ liên hệ của khách hàng, bao gồm khách đăng ký trên website.">
    <div className="space-y-4 px-4 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">Hồ sơ liên hệ</h2><Button variant="outline" disabled={query.isFetching} onClick={() => void query.refetch()}>{query.isFetching ? "Đang cập nhật…" : "Làm mới danh sách"}</Button></div>
      <CustomerStatistics />
      {success && <p role="status">{success}</p>}
      {query.isPending ? <ContentSkeleton /> : query.isError ? <div role="alert"><p>{getApiError(query.error).message}</p><Button variant="outline" onClick={() => void query.refetch()}>Tải lại khách hàng</Button></div> : <CustomerTable
        customers={query.data.data}
        searchQuery={search}
        status={status}
        onStatusChange={value => setParams(previous => { const next = new URLSearchParams(previous); if (value === "all") next.delete("status"); else next.set("status", value); next.set("page", "1"); return next })}
        onResetFilters={() => setParams(previous => { const next = new URLSearchParams(previous); next.delete("search"); next.delete("status"); next.set("page", "1"); return next })}
        page={page}
        total={query.data.pagination.total}
        totalPages={Math.max(1, query.data.pagination.totalPages)}
        onPageChange={changePage}
        onSearch={value => setParams(previous => { const next = new URLSearchParams(previous); if (value.trim()) next.set("search", value.trim()); else next.delete("search"); next.set("page", "1"); return next })}
        onDelete={async id => { if (!admin) return; setSuccess(""); await remove.mutateAsync(id); setSuccess("Đã xóa khách hàng."); if (query.data.data.length === 1 && page > 1) changePage(page - 1) }}
      />}
    </div>
  </BaseLayout>
}
