import { DeleteCategoryDialog } from "@/features/categories/components/delete-category-dialog"
import { Link } from "react-router-dom"
import { CatalogImage } from "@/components/catalog-image"
import { CategoryForm } from "@/features/categories/components/category-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useAuthStore } from "@/stores/auth.store"
import { ContentSkeleton } from "@/components/page-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useMemo } from "react"
import { useCategories } from "@/features/categories/hooks/use-categories"
import { useUpdateCategory } from "@/features/categories/hooks/use-update-category"
import type { Category } from "@/features/categories/types/categories"
import { getApiError } from "@/services/api"
import { BaseLayout } from "@/layout/admin/base-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { ListPagination } from "@/components/list-pagination"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FolderTree, FolderPlus, Pencil, Trash2, CheckCircle2, Folder, Layers } from "lucide-react"

export default function AdminCategoriesPage() {
  const canManage = useAuthStore(state => state.user?.role === "admin")
  const { data: categories = [], isLoading, isFetching, error, refetch } = useCategories()

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

  const [page, setPage] = useState(1)
  const limit = 10

  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const updateMutation = useUpdateCategory()

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.description || "").toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? cat.isActive
          : !cat.isActive

      return matchesSearch && matchesStatus
    })
  }, [categories, searchTerm, statusFilter])

  // Statistics
  const stats = useMemo(() => {
    const total = categories.length
    const active = categories.filter((c) => c.isActive).length
    const root = categories.filter((c) => !c.parent).length
    const sub = total - root
    return { total, active, root, sub }
  }, [categories])

  const isSaving = updateMutation.isPending

  const cards = [
    { label: "Tổng danh mục", value: stats.total, Icon: Folder, color: "text-muted-foreground" },
    { label: "Danh mục đang hoạt động", value: stats.active, Icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Danh mục gốc", value: stats.root, Icon: Layers, color: "text-primary" },
    { label: "Danh mục con", value: stats.sub, Icon: FolderTree, color: "text-muted-foreground" },
  ]
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / limit))
  const currentPage = Math.min(page, totalPages)
  const visibleCategories = filteredCategories.slice((currentPage - 1) * limit, currentPage * limit)

  return (
    <BaseLayout title="Danh mục" description="Quản lý danh mục sản phẩm và cấu trúc phân cấp.">
      <div className="space-y-4 px-4 lg:px-6">
        <section aria-label="Thống kê danh mục" className="grid grid-cols-2 gap-4 md:grid-cols-4" aria-busy={isFetching}>
          {cards.map(({ label, value, Icon, color }) => <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">{label}</CardTitle>
              <Icon className={`size-4 shrink-0 ${color}`} />
            </CardHeader>
            <CardContent><div className={`text-2xl font-bold ${color}`}>{isLoading ? <Skeleton className="h-8 w-20" /> : error ? "-" : value}</div><p className="mt-1 text-xs text-muted-foreground">Tất cả danh mục</p></CardContent>
          </Card>)}
        </section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{filteredCategories.length} danh mục</p>
          {canManage && <Button nativeButton={false} role="link" render={<Link to="/auth/categories/new" />}><FolderPlus />Thêm danh mục</Button>}
        </div>
        <section aria-label="Bộ lọc danh mục" className="space-y-3 rounded-lg border p-4">
          <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field className="lg:col-span-2"><FieldLabel htmlFor="category-search">Tên danh mục</FieldLabel><Input id="category-search" placeholder="Tìm theo tên, đường dẫn hoặc mô tả" value={searchTerm} onChange={event => { setSearchTerm(event.target.value); setPage(1) }} /></Field>
            <Field className="lg:col-span-2"><FieldLabel htmlFor="category-status">Trạng thái</FieldLabel><select id="category-status" className="h-8 rounded-md border bg-background px-2 text-sm" value={statusFilter} onChange={event => {
              const value = event.target.value
              if (value === "all" || value === "active" || value === "inactive") { setStatusFilter(value); setPage(1) }
            }}><option value="all">Tất cả trạng thái</option><option value="active">Đang hoạt động</option><option value="inactive">Ngừng hoạt động</option></select></Field>
            <Button type="button" variant="outline" className="sm:col-span-2 lg:col-span-4 lg:justify-self-end" onClick={() => { setSearchTerm(""); setStatusFilter("all"); setPage(1) }}>Đặt lại bộ lọc</Button>
          </div>
        </section>
        {isLoading ? <ContentSkeleton label="Đang tải danh mục" /> : error ? <div role="alert" className="space-y-3"><p>{getApiError(error).message}</p><Button variant="outline" onClick={() => void refetch()}>Tải lại danh mục</Button></div> : <>
          {isFetching && <p role="status" className="text-sm text-muted-foreground">Đang cập nhật danh mục...</p>}
          {!visibleCategories.length ? <div className="grid justify-items-center gap-3 rounded-lg border py-12"><FolderTree className="size-8 text-muted-foreground" /><p>Không tìm thấy danh mục.</p></div> : <div className="overflow-hidden rounded-lg border" aria-busy={isFetching}><Table>
            <TableHeader><TableRow>{["Danh mục", "Đường dẫn", "Mô tả", "Danh mục cha", "Trạng thái", "Ngày tạo", "Thao tác"].map(label => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{visibleCategories.map(category => {
              const parentName = typeof category.parent === "object" && category.parent !== null ? category.parent.name : categories.find(item => item._id === category.parent)?.name
              return <TableRow key={category._id}>
                <TableCell><div className="flex min-w-48 max-w-80 items-center gap-3"><CatalogImage src={category.icon} alt={category.name} /><span className="truncate font-medium" title={category.name}>{category.name}</span></div></TableCell>
                <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                <TableCell className="max-w-80 truncate text-muted-foreground" title={category.description}>{category.description || "-"}</TableCell>
                <TableCell>{parentName || "Danh mục gốc"}</TableCell>
                <TableCell><Badge variant={category.isActive ? "default" : "secondary"}>{category.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}</Badge></TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{category.createdAt ? new Date(category.createdAt).toLocaleDateString("vi-VN") : "-"}</TableCell>
                <TableCell><div className="flex gap-1">{canManage && <>
                  <Button variant="ghost" size="icon" aria-label={`Edit ${category.name}`} title="Chỉnh sửa danh mục" onClick={() => setEditingCategory(category)}><Pencil /></Button>
                  <Button variant="ghost" size="icon" aria-label={`Delete ${category.name}`} title="Xóa danh mục" onClick={() => setDeleteTarget(category)}><Trash2 className="text-destructive" /></Button>
                </>}</div></TableCell>
              </TableRow>
            })}</TableBody>
          </Table></div>}
          <ListPagination label="Phân trang danh mục" page={currentPage} totalPages={totalPages} disabled={isFetching} onPageChange={setPage} />
        </>}

        <Dialog open={!!editingCategory} onOpenChange={open => { if (!open && !isSaving) setEditingCategory(null) }}>
          <DialogContent showCloseButton={!isSaving} className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>Chỉnh sửa danh mục</DialogTitle><DialogDescription>Cập nhật thông tin và ảnh đại diện danh mục.</DialogDescription></DialogHeader>
            {editingCategory && <CategoryForm key={editingCategory._id} category={editingCategory} onCancel={() => setEditingCategory(null)} onSubmit={async input => { await updateMutation.mutateAsync({ id: editingCategory._id, input }); setEditingCategory(null) }} />}
          </DialogContent>
        </Dialog>

        {deleteTarget && canManage && <DeleteCategoryDialog key={deleteTarget._id} category={deleteTarget} onClose={() => setDeleteTarget(null)} />}
      </div>
    </BaseLayout>
  )
}
