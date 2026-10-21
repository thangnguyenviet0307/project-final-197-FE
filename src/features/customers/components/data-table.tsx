"use client"

import { useAuthStore } from "@/stores/auth.store"
import { Link } from "react-router-dom"


import { useState } from "react"
import { Search, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

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
  UpdateCustomerInput,
} from "@/features/customers/types/customers"

interface CustomerTableProps {
  customers: ICustomer[]
  page: number
  total: number
  totalPages: number
  onPageChange: (page: number) => void
  searchQuery: string
  onSearch: (value: string) => void
  onDelete: (id: string) => Promise<void> | void
  onEdit: (
    id: string,
    values: UpdateCustomerInput
  ) => Promise<void> | void
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
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")

  async function handleDelete() {
    if (deleting) return

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
        aria-label={`Delete ${customer.first_name} ${customer.last_name}`}
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
            Cancel
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
              : "Delete Customer"}
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
  onSearch,
  onDelete,
  onEdit,
  onAdd,
}: CustomerTableProps) {
  const admin = useAuthStore(state => state.user?.role === "admin")
  const [searchValue, setSearchValue] =
    useState(searchQuery)


  const [selectedIds, setSelectedIds] = useState<
    Set<string>
  >(() => new Set())

  const [previousSearchQuery, setPreviousSearchQuery] = useState(searchQuery)
  if (previousSearchQuery !== searchQuery) {
    setPreviousSearchQuery(searchQuery)
    setSearchValue(searchQuery)

  }

  // Phân trang 10 khách hàng
  const visibleCustomers = customers

  const allPageSelected =
    visibleCustomers.length > 0 &&
    visibleCustomers.every((customer) =>
      selectedIds.has(customer._id)
    )

  const somePageSelected =
    visibleCustomers.some((customer) =>
      selectedIds.has(customer._id)
    )

  function toggleRow(
    id: string,
    checked: boolean
  ) {
    setSelectedIds((previous) => {
      const next = new Set(previous)

      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }

      return next
    })
  }

  function togglePage(checked: boolean) {
    setSelectedIds((previous) => {
      const next = new Set(previous)

      for (const customer of visibleCustomers) {
        if (checked) {
          next.add(customer._id)
        } else {
          next.delete(customer._id)
        }
      }

      return next
    })
  }

  return (
    <div className="w-full space-y-4">
      {/* Tìm kiếm và thêm Customer */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form
          className="flex max-w-sm flex-1 items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            onSearch(searchValue)

          }}
        >
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              aria-label="Search customers"
              placeholder="Search customers..."
              value={searchValue}
              onChange={(event) => {
                const value = event.target.value

                setSearchValue(value)

                if (!value.trim() && searchQuery) {
                  onSearch("")

                }
              }}
              className="pl-9 pr-9"
            />

            {searchValue && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
                onClick={() => {
                  setSearchValue("")
                  onSearch("")

                }}
              >
                <X className="size-4" />
                <span className="sr-only">
                  Clear search
                </span>
              </Button>
            )}
          </div>

          <Button
            type="submit"
            variant="outline"
          >
            Search
          </Button>
        </form>

        <CustomerFormDialog
          onSubmit={onAdd}
          submitLabel="Create Customer"
        />
      </div>

      {/* Bảng Customers */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  aria-label="Select all customers on page"
                  checked={allPageSelected}
                  indeterminate={
                    !allPageSelected &&
                    somePageSelected
                  }
                  onCheckedChange={(checked) =>
                    togglePage(checked === true)
                  }
                />
              </TableHead>

              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {visibleCustomers.length > 0 ? (
              visibleCustomers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell>
                    <Checkbox
                      aria-label={`Select ${customer.first_name} ${customer.last_name}`}
                      checked={selectedIds.has(
                        customer._id
                      )}
                      onCheckedChange={(checked) =>
                        toggleRow(
                          customer._id,
                          checked === true
                        )
                      }
                    />
                  </TableCell>

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

                  {/* Ngày sinh */}


                  {/* Chỉnh sửa và xóa */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link className="text-sm underline" to={`/orders?customerId=${customer._id}`}>Order history</Link>
                      {admin && <CustomerFormDialog
                        customer={customer}
                        onSubmit={(values) =>
                          onEdit(
                            customer._id,
                            values
                          )
                        }
                        submitLabel="Save Changes"
                      />}

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
                  No customers found.
                  {page > 1 && <Button variant="outline" onClick={() => onPageChange(totalPages)}>Return to available customers</Button>}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Phân trang */}
      <nav aria-label="Customers pagination" className="flex flex-wrap items-center justify-between gap-4 py-4">
        <span className="text-sm text-muted-foreground">
          Total: {total} customers
        </span>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={
              page >= totalPages
            }
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </nav>
    </div>
  )
}
