"use client"
import { isAdministrator } from "@/features/auth/utils/roles"

import { useAuthStore } from "@/stores/auth.store"
import { CustomerProfileDialog } from "@/features/customers/components/customer-profile-dialog"
import { customerAddress, customerBirthDate, customerGender } from "@/features/customers/utils/customer-profile"


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



import type {
  ICustomer,
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

}

// Dialog xác nhận xóa Customer
function DeleteCustomerDialog({
  customer,
  onDelete,
}: {
  customer: ICustomer
  onDelete: (id: string) => Promise<void> | void
}) {
  const admin = useAuthStore(state => isAdministrator(state.user?.role))
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
}: CustomerTableProps) {
  const admin = useAuthStore(state => isAdministrator(state.user?.role))
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
      </div>
      <form aria-label="Bộ lọc khách hàng" className="grid items-end gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4" onSubmit={event => { event.preventDefault(); onSearch(searchValue) }}>
        <Field className="lg:col-span-2"><FieldLabel htmlFor="customer-search">Tên, email hoặc số điện thoại</FieldLabel><Input id="customer-search" aria-label="Tìm khách hàng" placeholder="Tìm khách hàng..." value={searchValue} onChange={event => { setSearchValue(event.target.value); if (!event.target.value.trim() && searchQuery) onSearch("") }} /></Field>
        <Field><FieldLabel htmlFor="customer-status">Trạng thái</FieldLabel><select id="customer-status" className="h-8 rounded-md border bg-background px-2 text-sm" value={status} onChange={event => onStatusChange?.(event.target.value === "active" ? "active" : event.target.value === "inactive" ? "inactive" : "all")}><option value="all">Tất cả trạng thái</option><option value="active">Đang hoạt động</option><option value="inactive">Ngừng hoạt động</option></select></Field>
        <div className="flex gap-2"><Button type="submit" variant="outline"><Search />Tìm kiếm</Button><Button type="button" variant="outline" onClick={() => { setSearchValue(""); if (onResetFilters) onResetFilters(); else onSearch("") }}>Đặt lại</Button></div>
      </form>
      {/* Bảng Customers */}
      <div className="overflow-x-auto rounded-md border">
        <Table aria-label="Hồ sơ khách hàng">
          <TableHeader>
            <TableRow>

              <TableHead>Khách hàng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Điện thoại</TableHead>
              <TableHead>Ngày sinh</TableHead>
              <TableHead>Giới tính</TableHead>
              <TableHead>Người nhận hàng</TableHead>
              <TableHead>Email nhận hàng</TableHead>
              <TableHead>Địa chỉ giao hàng</TableHead>
              <TableHead>Thời gian giao hàng</TableHead>
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

                    </div>
                  </TableCell>

                  <TableCell>{customer.email}</TableCell>

                  {/* Số điện thoại */}
                  <TableCell>
                    {customer.phone || "Chưa cung cấp"}
                  </TableCell>

                  <TableCell className="whitespace-nowrap">{customerBirthDate(customer.birthDate)}</TableCell>
                  <TableCell>{customerGender(customer.gender)}</TableCell>
                  <TableCell>{customer.shippingAddress?.recipientName || "Chưa cung cấp"}</TableCell>
                  <TableCell>{customer.shippingAddress?.email || "Chưa cung cấp"}</TableCell>

                  {/* Địa chỉ */}
                  <TableCell className="min-w-64 max-w-80 whitespace-normal wrap-break-word">{customerAddress(customer)}</TableCell>
                  <TableCell className="min-w-40 max-w-64 whitespace-normal wrap-break-word">{customer.shippingAddress?.deliveryTime || "Chưa cung cấp"}</TableCell>

                  <TableCell><Badge variant={customer.isActive === false ? "destructive" : "secondary"}>{customer.isActive === undefined ? "Chưa xác định" : customer.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}</Badge></TableCell>


                  {/* Chỉnh sửa và xóa */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link className="text-sm underline" to={`/auth/orders?customerId=${customer._id}`}>Lịch sử đơn hàng</Link>
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
                  colSpan={11}
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
