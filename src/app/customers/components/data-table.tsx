
"use client"

import { useEffect, useMemo, useState } from "react"
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

import { CustomerFormDialog } from "./customer-form-dialog"

import type {
  ICustomer,
  CreateCustomerInput,
  UpdateCustomerInput,
} from "@/app/customers/type"

interface CustomerTableProps {
  customers: ICustomer[]
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
              {customer.last_name} {customer.first_name}
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

const PAGE_SIZE = 10

export function CustomerTable({
  customers,
  searchQuery,
  onSearch,
  onDelete,
  onEdit,
  onAdd,
}: CustomerTableProps) {
  const [searchValue, setSearchValue] =
    useState(searchQuery)

  const [pageIndex, setPageIndex] = useState(0)

  const [selectedIds, setSelectedIds] = useState<
    Set<string>
  >(() => new Set())

  useEffect(() => {
    setSearchValue(searchQuery)
    setPageIndex(0)
  }, [searchQuery])

  // Phân trang 10 khách hàng
  const pageCount = Math.max(
    1,
    Math.ceil(customers.length / PAGE_SIZE)
  )

  const currentPage = Math.min(
    pageIndex,
    pageCount - 1
  )

  const visibleCustomers = useMemo(() => {
    const start = currentPage * PAGE_SIZE

    return customers.slice(
      start,
      start + PAGE_SIZE
    )
  }, [customers, currentPage])

  // Checkbox chọn tất cả trong trang
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
            setPageIndex(0)
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search customers..."
              value={searchValue}
              onChange={(event) => {
                const value = event.target.value

                setSearchValue(value)

                if (!value.trim() && searchQuery) {
                  onSearch("")
                  setPageIndex(0)
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
                  setPageIndex(0)
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
              <TableHead>Birthday</TableHead>
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
                        {customer.last_name}{" "}
                        {customer.first_name}
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
                  <TableCell>
                    {customer.birthday
                      ? customer.birthday.slice(0, 10)
                      : "—"}
                  </TableCell>

                  {/* Chỉnh sửa và xóa */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CustomerFormDialog
                        customer={customer}
                        onSubmit={(values) =>
                          onEdit(
                            customer._id,
                            values
                          )
                        }
                        submitLabel="Save Changes"
                      />

                      <DeleteCustomerDialog
                        customer={customer}
                        onDelete={onDelete}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center"
                >
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Phân trang */}
      <div className="flex items-center justify-between gap-4 py-4">
        <span className="text-sm text-muted-foreground">
          Total: {customers.length} customers
        </span>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {pageCount}
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage === 0}
            onClick={() =>
              setPageIndex(
                Math.max(0, currentPage - 1)
              )
            }
          >
            Previous
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={
              currentPage >= pageCount - 1
            }
            onClick={() =>
              setPageIndex(
                Math.min(
                  pageCount - 1,
                  currentPage + 1
                )
              )
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
