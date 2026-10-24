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
    { label: "Total categories", value: stats.total, Icon: Folder, color: "text-muted-foreground" },
    { label: "Active categories", value: stats.active, Icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Root categories", value: stats.root, Icon: Layers, color: "text-primary" },
    { label: "Subcategories", value: stats.sub, Icon: FolderTree, color: "text-muted-foreground" },
  ]
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / limit))
  const currentPage = Math.min(page, totalPages)
  const visibleCategories = filteredCategories.slice((currentPage - 1) * limit, currentPage * limit)

  return (
    <BaseLayout title="Categories" description="Manage your product categories and hierarchy.">
      <div className="space-y-4 px-4 lg:px-6">
        <section aria-label="Category statistics" className="grid grid-cols-2 gap-4 md:grid-cols-4" aria-busy={isFetching}>
          {cards.map(({ label, value, Icon, color }) => <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">{label}</CardTitle>
              <Icon className={`size-4 shrink-0 ${color}`} />
            </CardHeader>
            <CardContent><div className={`text-2xl font-bold ${color}`}>{isLoading ? <Skeleton className="h-8 w-20" /> : error ? "-" : value}</div><p className="mt-1 text-xs text-muted-foreground">All categories</p></CardContent>
          </Card>)}
        </section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{filteredCategories.length} categories</p>
          {canManage && <Button nativeButton={false} role="link" render={<Link to="/categories/new" />}><FolderPlus />Add category</Button>}
        </div>
        <section aria-label="Category filters" className="space-y-3 rounded-lg border p-4">
          <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field className="lg:col-span-2"><FieldLabel htmlFor="category-search">Category name</FieldLabel><Input id="category-search" placeholder="Search name, slug or description" value={searchTerm} onChange={event => { setSearchTerm(event.target.value); setPage(1) }} /></Field>
            <Field className="lg:col-span-2"><FieldLabel htmlFor="category-status">Status</FieldLabel><select id="category-status" className="h-8 rounded-md border bg-background px-2 text-sm" value={statusFilter} onChange={event => {
              const value = event.target.value
              if (value === "all" || value === "active" || value === "inactive") { setStatusFilter(value); setPage(1) }
            }}><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></Field>
            <Button type="button" variant="outline" className="sm:col-span-2 lg:col-span-4 lg:justify-self-end" onClick={() => { setSearchTerm(""); setStatusFilter("all"); setPage(1) }}>Reset filters</Button>
          </div>
        </section>
        {isLoading ? <ContentSkeleton label="Loading categories" /> : error ? <div role="alert" className="space-y-3"><p>{getApiError(error).message}</p><Button variant="outline" onClick={() => void refetch()}>Retry categories</Button></div> : <>
          {isFetching && <p role="status" className="text-sm text-muted-foreground">Updating categories...</p>}
          {!visibleCategories.length ? <div className="grid justify-items-center gap-3 rounded-lg border py-12"><FolderTree className="size-8 text-muted-foreground" /><p>No categories found.</p></div> : <div className="overflow-hidden rounded-lg border" aria-busy={isFetching}><Table>
            <TableHeader><TableRow>{["Category", "Slug", "Description", "Parent category", "Status", "Created", "Actions"].map(label => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{visibleCategories.map(category => {
              const parentName = typeof category.parent === "object" && category.parent !== null ? category.parent.name : categories.find(item => item._id === category.parent)?.name
              return <TableRow key={category._id}>
                <TableCell><div className="flex min-w-48 max-w-80 items-center gap-3"><CatalogImage src={category.icon} alt={category.name} /><span className="truncate font-medium" title={category.name}>{category.name}</span></div></TableCell>
                <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                <TableCell className="max-w-80 truncate text-muted-foreground" title={category.description}>{category.description || "-"}</TableCell>
                <TableCell>{parentName || "Root category"}</TableCell>
                <TableCell><Badge variant={category.isActive ? "default" : "secondary"}>{category.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{category.createdAt ? new Date(category.createdAt).toLocaleDateString("vi-VN") : "-"}</TableCell>
                <TableCell><div className="flex gap-1">{canManage && <>
                  <Button variant="ghost" size="icon" aria-label={`Edit ${category.name}`} title="Edit category" onClick={() => setEditingCategory(category)}><Pencil /></Button>
                  <Button variant="ghost" size="icon" aria-label={`Delete ${category.name}`} title="Delete category" onClick={() => setDeleteTarget(category)}><Trash2 className="text-destructive" /></Button>
                </>}</div></TableCell>
              </TableRow>
            })}</TableBody>
          </Table></div>}
          <ListPagination label="Categories pagination" page={currentPage} totalPages={totalPages} disabled={isFetching} onPageChange={setPage} />
        </>}

        <Dialog open={!!editingCategory} onOpenChange={open => { if (!open && !isSaving) setEditingCategory(null) }}>
          <DialogContent showCloseButton={!isSaving} className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>Edit category</DialogTitle><DialogDescription>Update category information and its thumbnail.</DialogDescription></DialogHeader>
            {editingCategory && <CategoryForm key={editingCategory._id} category={editingCategory} onCancel={() => setEditingCategory(null)} onSubmit={async input => { await updateMutation.mutateAsync({ id: editingCategory._id, input }); setEditingCategory(null) }} />}
          </DialogContent>
        </Dialog>

        {deleteTarget && canManage && <DeleteCategoryDialog key={deleteTarget._id} category={deleteTarget} onClose={() => setDeleteTarget(null)} />}
      </div>
    </BaseLayout>
  )
}
