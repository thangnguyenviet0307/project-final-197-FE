import { isAdministrator } from "@/features/auth/utils/roles"
import { useAuthStore } from "@/stores/auth.store"
import { getApiError } from "@/services/api"
import { Link } from "react-router-dom"
import { CatalogImage } from "@/components/catalog-image"


import { useEffect, useState } from "react"
import { Tags, Trash2, Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ListPagination } from "@/components/list-pagination"
import { Field, FieldLabel } from "@/components/ui/field"
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

import { BrandFormDialog } from "@/features/brands/components/brand-form-dialog"

import type {
  IBrand,
  UpdateBrandInput,
} from "@/features/brands/types/brands"

interface BrandTableProps {
  brands: IBrand[]
  searchQuery: string
  onSearch: (value: string) => void
  onDelete: (id: string) => Promise<void> | void
  onEdit: (
    id: string,
    values: UpdateBrandInput
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
    } catch (error) {
      setError(getApiError(error).message)
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
        aria-label={`Xóa ${brand.name}`}
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
            {deleting ? "Deleting..." : "Xóa thương hiệu"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function BrandTable({ brands, searchQuery, onSearch, onDelete, onEdit }: BrandTableProps) {
  const admin = useAuthStore(state => isAdministrator(state.user?.role))
  const [searchValue, setSearchValue] = useState(searchQuery)
  const [page, setPage] = useState(1)
  const limit = 10
  const [status, setStatus] = useState("all")
  const [previousSearch, setPreviousSearch] = useState(searchQuery)
  if (previousSearch !== searchQuery) {
    setPreviousSearch(searchQuery)
    setSearchValue(searchQuery)
    setPage(1)
  }
  useEffect(() => {
    if (searchValue.trim() === searchQuery.trim()) return
    const timer = window.setTimeout(() => onSearch(searchValue), 350)
    return () => window.clearTimeout(timer)
  }, [searchValue, searchQuery, onSearch])
  const filtered = brands.filter(brand => status === "all" || brand.isActive === (status === "active"))
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * limit, currentPage * limit)
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">{filtered.length} thương hiệu</p>
      {admin && <Button nativeButton={false} role="link" render={<Link to="/auth/brands/new" />}><Plus />Thêm thương hiệu</Button>}
    </div>
    <section aria-label="Bộ lọc thương hiệu" className="space-y-3 rounded-lg border p-4">
      <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field className="lg:col-span-2"><FieldLabel htmlFor="brand-search">Tên thương hiệu</FieldLabel><Input id="brand-search" placeholder="Tìm theo tên, đường dẫn hoặc mô tả" value={searchValue} onChange={event => { setSearchValue(event.target.value); if (!event.target.value.trim()) onSearch("") }} /></Field>
        <Field className="lg:col-span-2"><FieldLabel htmlFor="brand-status">Trạng thái</FieldLabel><select id="brand-status" className="h-8 rounded-md border bg-background px-2 text-sm" value={status} onChange={event => { setStatus(event.target.value); setPage(1) }}><option value="all">Tất cả trạng thái</option><option value="active">Đang hoạt động</option><option value="inactive">Ngừng hoạt động</option></select></Field>
        <Button type="button" variant="outline" className="sm:col-span-2 lg:col-span-4 lg:justify-self-end" onClick={() => { setSearchValue(""); setStatus("all"); setPage(1); onSearch("") }}>Đặt lại bộ lọc</Button>
      </div>
    </section>
    {!visible.length ? <div className="grid justify-items-center gap-3 rounded-lg border py-12"><Tags className="size-8 text-muted-foreground" /><p>Không tìm thấy thương hiệu.</p></div> : <div className="overflow-hidden rounded-lg border"><Table>
      <TableHeader><TableRow>{["Thương hiệu", "Đường dẫn", "Mô tả", "Trạng thái", "Thao tác"].map(label => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader>
      <TableBody>{visible.map(brand => <TableRow key={brand._id}>
        <TableCell><div className="flex min-w-48 max-w-80 items-center gap-3"><CatalogImage src={brand.logoUrl} alt={brand.name} /><span className="truncate font-medium" title={brand.name}>{brand.name}</span></div></TableCell>
        <TableCell className="text-muted-foreground">{brand.slug}</TableCell>
        <TableCell className="max-w-80 truncate text-muted-foreground" title={brand.description}>{brand.description || "-"}</TableCell>
        <TableCell><Badge variant={brand.isActive ? "default" : "secondary"}>{brand.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}</Badge></TableCell>
        <TableCell>{admin && <div className="flex gap-1"><BrandFormDialog brand={brand} onSubmit={values => onEdit(brand._id, values)} submitLabel="Lưu thay đổi" /><DeleteBrandDialog brand={brand} onDelete={onDelete} /></div>}</TableCell>
      </TableRow>)}</TableBody>
    </Table></div>}
    <ListPagination label="Phân trang thương hiệu" page={currentPage} totalPages={totalPages} onPageChange={setPage} />
  </div>
}
