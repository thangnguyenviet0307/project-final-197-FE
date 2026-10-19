
"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Trash2, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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

import { BrandFormDialog } from "./brand-form-dialog"

import type {
  IBrand,
  CreateBrandInput,
  UpdateBrandInput,
} from "@/app/brands/type"

interface BrandTableProps {
  brands: IBrand[]
  searchQuery: string
  onSearch: (value: string) => void
  onDelete: (id: string) => Promise<void> | void
  onEdit: (
    id: string,
    values: UpdateBrandInput
  ) => Promise<void> | void
  onAdd: (
    values: CreateBrandInput
  ) => Promise<void> | void
}

function DeleteBrandDialog({
  brand,
  onDelete,
}: {
  brand: IBrand
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
      await onDelete(brand._id)
      setOpen(false)
    } catch {
      setError(
        "Không thể xóa thương hiệu. Vui lòng thử lại."
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
        className="h-8 w-8 text-destructive"
        aria-label={`Delete ${brand.name}`}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
      </Button>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Xác nhận xóa thương hiệu
          </AlertDialogTitle>

          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa thương hiệu{" "}
            <strong>{brand.name}</strong> không?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p role="alert" className="text-sm text-destructive">
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
            {deleting ? "Deleting..." : "Delete Brand"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const PAGE_SIZE = 10

export function BrandTable({
  brands,
  searchQuery,
  onSearch,
  onDelete,
  onEdit,
  onAdd,
}: BrandTableProps) {
  const [searchValue, setSearchValue] = useState(searchQuery)
  const [pageIndex, setPageIndex] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set()
  )

  useEffect(() => {
    setSearchValue(searchQuery)
    setPageIndex(0)
  }, [searchQuery])

  const pageCount = Math.max(
    1,
    Math.ceil(brands.length / PAGE_SIZE)
  )

  const currentPage = Math.min(
    pageIndex,
    pageCount - 1
  )

  const visibleBrands = useMemo(() => {
    const start = currentPage * PAGE_SIZE
    return brands.slice(start, start + PAGE_SIZE)
  }, [brands, currentPage])

  const allPageSelected =
    visibleBrands.length > 0 &&
    visibleBrands.every((brand) =>
      selectedIds.has(brand._id)
    )

  const somePageSelected =
    visibleBrands.some((brand) =>
      selectedIds.has(brand._id)
    )

  function toggleRow(id: string, checked: boolean) {
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

      for (const brand of visibleBrands) {
        if (checked) {
          next.add(brand._id)
        } else {
          next.delete(brand._id)
        }
      }

      return next
    })
  }

  return (
    <div className="w-full space-y-4">
      {/* Search và Add Brand */}
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
              placeholder="Search brands..."
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

          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <BrandFormDialog
          onSubmit={onAdd}
          submitLabel="Create Brand"
        />
      </div>

      {/* Brands Table */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                
              <Checkbox
                aria-label="Select all brands on page"
                checked={allPageSelected}
                indeterminate={!allPageSelected && somePageSelected}
                onCheckedChange={(checked) =>
                togglePage(checked === true)
             }
            />

              </TableHead>

              <TableHead>Brand</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {visibleBrands.length > 0 ? (
              visibleBrands.map((brand) => (
                <TableRow key={brand._id}>
                  <TableCell>
                    <Checkbox
                      aria-label={`Select ${brand.name}`}
                      checked={selectedIds.has(brand._id)}
                      onCheckedChange={(checked) =>
                        toggleRow(
                          brand._id,
                          checked === true
                        )
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {brand.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {brand.description || "No description"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary">
                      {brand.slug}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        brand.isActive
                          ? "default"
                          : "secondary"
                      }
                    >
                      {brand.isActive
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BrandFormDialog
                        brand={brand}
                        onSubmit={(values) =>
                          onEdit(brand._id, values)
                        }
                        submitLabel="Save Changes"
                      />

                      <DeleteBrandDialog
                        brand={brand}
                        onDelete={onDelete}
                      />
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
                  No brands found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4 py-4">
        <span className="text-sm text-muted-foreground">
          Total: {brands.length} brands
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
              setPageIndex(Math.max(0, currentPage - 1))
            }
          >
            Previous
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage >= pageCount - 1}
            onClick={() =>
              setPageIndex(
                Math.min(pageCount - 1, currentPage + 1)
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
