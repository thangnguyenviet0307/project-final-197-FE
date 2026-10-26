"use client"

import { useAuthStore } from "@/stores/auth.store"
import { CustomerProfileDialog } from "@/features/customers/components/customer-profile-dialog"


import { useState } from "react"
import { Link } from "react-router-dom"
import { Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Field, FieldLabel } from "@/components/ui/field"
import { ListPagination } from "@/components/list-pagination"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { CustomerFormDialog } from "@/features/customers/components/customer-form-dialog"

import type {
  ICustomer,
  CreateCustomerInput,
  CustomerStatus,
} from "@/features/customers/types/customers"

interface CustomerTableProps {
  customers: ICustomer[]
  page: number
  total: number
  totalPages: number
  onPageChange: (page: number) => void
  searchQuery: string
  status?: CustomerStatus
  onStatusChange?: (status: CustomerStatus) => void
  onResetFilters?: () => void
  onSearch: (value: string) => void
  onDelete: (id: string) => Promise<void> | void
  onAdd: (
    values: CreateCustomerInput
  ) => Promise<void> | void
}

// Dialog xác nhận xóa Customer
function DeleteCustomerDialog({
  customer,
  onDelete,
}: {
  customer: ICustomer
  onDelete: (id: string) => Promise<void> | void
}) {
  const admin = useAuthStore(state => state.user?.role === "admin")
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")

  async function handleDelete() {
    if (!admin || deleting) return

    setDeleting(true)
    setError("")

    try {
      await onDelete(customer._id)
      setOpen(false)
    } catch {
      setError(
        "Không thể xóa khách hàng. Vui lòng thử lại."
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (!deleting) {
          setOpen(value)
          if (!value) setError("")
        }
      }}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 cursor-pointer text-destructive"
        aria-label={`Xóa ${customer.first_name} ${customer.last_name}`}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
      </Button>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Xác nhận xóa khách hàng
          </AlertDialogTitle>

          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa khách hàng{" "}
            <strong>
              {customer.first_name} {customer.last_name}
            </strong>{" "}
            không?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p
            role="alert"
            className="text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>
            Hủy
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={deleting}
            onClick={(event) => {
              event.preventDefault()
              void handleDelete()
            }}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {deleting
              ? "Deleting..."
              : "Xóa khách hàng"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


export function CustomerTable({
  customers,
  page, total, totalPages, onPageChange,
  searchQuery,
  status = "all", onStatusChange, onResetFilters,
  onSearch,
  onDelete,
  onAdd,
}: CustomerTableProps) {
  const admin = useAuthStore(state => state.user?.role === "admin")
  const [searchValue, setSearchValue] =
    useState(searchQuery)


  const [previousSearchQuery, setPreviousSearchQuery] = useState(searchQuery)
  if (previousSearchQuery !== searchQuery) {
    setPreviousSearchQuery(searchQuery)
    setSearchValue(searchQuery)

  }

  // Phân trang 10 khách hàng
  const visibleCustomers = customers

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Tổng cộng: {total} khách hàng</p>
        <CustomerFormDialog onSubmit={onAdd} submitLabel="Tạo khách hàng" />
      </div>
      <form aria-label="Bộ lọc khách hàng" className="grid items-end gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4" onSubmit={event => { event.preventDefault(); onSearch(searchValue) }}>
        <Field className="lg:col-span-2"><FieldLabel htmlFor="customer-search">Tên, email hoặc số điện thoại</FieldLabel><Input id="customer-search" aria-label="Tìm khách hàng" placeholder="Tìm khách hàng..." value={searchValue} onChange={event => { setSearchValue(event.target.value); if (!event.target.value.trim() && searchQuery) onSearch("") }} /></Field>
        <Field><FieldLabel htmlFor="customer-status">Trạng thái</FieldLabel><select id="customer-status" className="h-8 rounded-md border bg-background px-2 text-sm" value={status} onChange={event => onStatusChange?.(event.target.value === "active" ? "active" : event.target.value === "inactive" ? "inactive" : "all")}><option value="all">Tất cả trạng thái</option><option value="active">Đang hoạt động</option><option value="inactive">Ngừng hoạt động</option></select></Field>
        <div className="flex gap-2"><Button type="submit" variant="outline"><Search />Tìm kiếm</Button><Button type="button" variant="outline" onClick={() => { setSearchValue(""); if (onResetFilters) onResetFilters(); else onSearch("") }}>Đặt lại</Button></div>
      </form>
      {/* Bảng Customers */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>

              <TableHead>Khách hàng</TableHead>
              <TableHead>Điện thoại</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {visibleCustomers.length > 0 ? (
              visibleCustomers.map((customer) => (
                <TableRow key={customer._id}>

                  {/* Họ tên và Email */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {customer.first_name}{" "}
                        {customer.last_name}
                      </span>

                      <span className="text-sm text-muted-foreground">
                        {customer.email}
                      </span>
                    </div>
                  </TableCell>

                  {/* Số điện thoại */}
                  <TableCell>
                    {customer.phone}
                  </TableCell>

                  {/* Địa chỉ */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span>
                        {customer.street}
                      </span>

                      <span className="text-sm text-muted-foreground">
                        {[
                          customer.city,
                          customer.state,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell><Badge variant={customer.isActive === false ? "destructive" : "secondary"}>{customer.isActive === undefined ? "Chưa xác định" : customer.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}</Badge></TableCell>


                  {/* Chỉnh sửa và xóa */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link className="text-sm underline" to={`/orders?customerId=${customer._id}`}>Lịch sử đơn hàng</Link>
                      <CustomerProfileDialog customer={customer} />

                      {admin && <DeleteCustomerDialog
                        customer={customer}
                        onDelete={onDelete}
                      />}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center"
                >
                  Không tìm thấy khách hàng.
                  {page > 1 && <Button variant="outline" onClick={() => onPageChange(totalPages)}>Về trang khách hàng hiện có</Button>}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Phân trang */}
      <ListPagination label="Customers pagination" page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  )
}
