import { ContentSkeleton } from "@/components/page-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useMemo } from "react"
import { useCategories } from "@/hooks/categories/use-categories"
import { useCreateCategory } from "@/hooks/categories/use-create-category"
import { useUpdateCategory } from "@/hooks/categories/use-update-category"
import { useDeleteCategory } from "@/hooks/categories/use-delete-category"
import { type Category, type CreateCategoryInput } from "@/services/categories.service"
import { getApiError } from "@/services/api"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  FolderTree,
  FolderPlus,
  Pencil,
  Trash2,
  LoaderCircle,
  Search,
  CheckCircle2,
  Folder,
  Layers,
  BatteryCharging,
  Cable,
  Camera,
  HardDrive,
  Headphones,
  Laptop,
  Package,
  PlugZap,
  ShieldCheck,
  Smartphone,
  Speaker,
  Tablet,
  Watch,
  Wifi,
  type LucideIcon,
} from "lucide-react"


function getCategoryIcon(name: string): { Icon: LucideIcon; color: string } {
  const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  const colors = {
    phone: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    audio: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    charging: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    protection: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    storage: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    other: "bg-muted text-muted-foreground",
  }

  if (/tai nghe|headphones?|earbuds?|earphones?|airpods?/.test(normalized)) {
    return { Icon: Headphones, color: colors.audio }
  }
  if (/op lung|bao da|phone case|case|cover/.test(normalized)) {
    return { Icon: Smartphone, color: colors.phone }
  }
  if (/kinh cuong luc|cuong luc|mieng dan|screen protector|tempered glass/.test(normalized)) {
    return { Icon: ShieldCheck, color: colors.protection }
  }
  if (/sac du phong|power bank|pin|battery/.test(normalized)) {
    return { Icon: BatteryCharging, color: colors.charging }
  }
  if (/sac|charger|adapter/.test(normalized)) {
    return { Icon: PlugZap, color: colors.charging }
  }
  if (/cap|cable|usb/.test(normalized)) {
    return { Icon: Cable, color: colors.charging }
  }
  if (/dien thoai|phone|smartphone|mobile/.test(normalized)) {
    return { Icon: Smartphone, color: colors.phone }
  }
  if (/tablet|ipad/.test(normalized)) {
    return { Icon: Tablet, color: colors.phone }
  }
  if (/laptop|notebook/.test(normalized)) {
    return { Icon: Laptop, color: colors.phone }
  }
  if (/dong ho|watch|smartwatch/.test(normalized)) {
    return { Icon: Watch, color: colors.phone }
  }
  if (/camera|may anh/.test(normalized)) {
    return { Icon: Camera, color: colors.audio }
  }
  if (/loa|speaker|am thanh/.test(normalized)) {
    return { Icon: Speaker, color: colors.audio }
  }
  if (/the nho|o cung|hard drive|ssd|storage/.test(normalized)) {
    return { Icon: HardDrive, color: colors.storage }
  }
  if (/wifi|router|mang|network/.test(normalized)) {
    return { Icon: Wifi, color: colors.storage }
  }
  return { Icon: Package, color: colors.other }
}

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading, error } = useCategories()

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CreateCategoryInput>({
    name: "",
    description: "",
    parent: null,
    isActive: true,
  })
  const [formError, setFormError] = useState<string | null>(null)

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Mutations
  const createMutation = useCreateCategory({
    onSuccess: () => {
      closeForm()
    },
    onError: (err) => {
      setFormError(getApiError(err).message)
    },
  })

  const updateMutation = useUpdateCategory({
    onSuccess: () => {
      closeForm()
    },
    onError: (err) => {
      setFormError(getApiError(err).message)
    },
  })

  const deleteMutation = useDeleteCategory({
    onSuccess: () => {
      setDeleteTarget(null)
      setDeleteError(null)
    },
    onError: (err) => {
      setDeleteError(getApiError(err).message)
    },
  })

  // Open Form for Create
  const handleOpenCreate = () => {
    setEditingCategory(null)
    setFormData({
      name: "",
      description: "",
      parent: null,
      isActive: true,
    })
    setFormError(null)
    setIsFormOpen(true)
  }

  // Open Form for Edit
  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category)
    const parentId =
      typeof category.parent === "object" && category.parent !== null
        ? category.parent._id
        : typeof category.parent === "string"
        ? category.parent
        : null

    setFormData({
      name: category.name,
      description: category.description || "",
      parent: parentId,
      isActive: category.isActive,
    })
    setFormError(null)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingCategory(null)
    setFormError(null)
  }

  // Handle Form Submit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.name.trim()) {
      setFormError("Tên danh mục không được để trống")
      return
    }

    if (editingCategory) {
      updateMutation.mutate({
        id: editingCategory._id,
        input: formData,
      })
    } else {
      createMutation.mutate(formData)
    }
  }

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

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <BaseLayout>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
              <FolderTree className="h-7 w-7 text-primary" />
              Quản lý danh mục (Categories)
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý phân loại sản phẩm, cấu trúc danh mục cha - con và trạng thái hiển thị
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2 shadow-sm">
            <FolderPlus className="h-4 w-4" />
            Thêm danh mục mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                Tổng danh mục
              </CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                Đang hoạt động
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {isLoading ? <Skeleton className="h-8 w-16" /> : stats.active}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                Danh mục gốc
              </CardTitle>
              <Layers className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : stats.root}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                Danh mục con
              </CardTitle>
              <FolderTree className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : stats.sub}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên danh mục, slug, mô tả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Trạng thái:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === "all" || value === "active" || value === "inactive") setStatusFilter(value)
                  }}
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="all">Tất cả ({categories.length})</option>
                  <option value="active">Đang hoạt động ({stats.active})</option>
                  <option value="inactive">Đang ẩn ({stats.total - stats.active})</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <ContentSkeleton label="Loading categories" />
            ) : error ? (
              <div className="p-8 text-center text-destructive">
                Không thể tải danh sách danh mục: {getApiError(error).message}
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                Không tìm thấy danh mục nào phù hợp.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Danh mục</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Danh mục cha</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => {
                      const parentName =
                        typeof category.parent === "object" && category.parent !== null
                          ? category.parent.name
                          : categories.find((c) => c._id === category.parent)?.name
                      const { Icon: CategoryIcon, color: iconColor } = getCategoryIcon(
                        `${category.name} ${category.description ?? ""}`,
                      )

                      return (
                        <TableRow key={category._id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg ${iconColor}`}>
                                <CategoryIcon className="size-4" aria-hidden="true" />
                              </span>
                              <span>{category.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">
                              {category.slug}
                            </code>
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-xs truncate">
                            {category.description || "—"}
                          </TableCell>
                          <TableCell>
                            {parentName ? (
                              <Badge variant="outline" className="font-normal text-xs">
                                {parentName}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="font-normal text-xs">
                                Danh mục gốc
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {category.isActive ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-200 dark:border-emerald-800">
                                Hoạt động
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                Đang ẩn
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {category.createdAt ? new Date(category.createdAt).toLocaleDateString("vi-VN") : "—"}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(category)}
                                title="Chỉnh sửa"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteTarget(category)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="Xóa"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal Thêm / Chỉnh sửa Danh mục */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-xl border bg-background p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {editingCategory ? <Pencil className="h-5 w-5 text-primary" /> : <FolderPlus className="h-5 w-5 text-primary" />}
                  {editingCategory ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
                </h3>
                <button
                  onClick={closeForm}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-4 pt-4">
                {formError && (
                  <div className="p-3 text-sm rounded-md bg-destructive/15 text-destructive border border-destructive/20">
                    {formError}
                  </div>
                )}

                {/* Tên danh mục */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Tên danh mục <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="Ví dụ: Tai nghe không dây, Điện thoại..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                {/* Mô tả */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Mô tả danh mục</label>
                  <textarea
                    rows={3}
                    placeholder="Mô tả tóm tắt về loại sản phẩm trong danh mục..."
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                {/* Danh mục cha */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Danh mục cha</label>
                  <select
                    value={formData.parent || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        parent: e.target.value ? e.target.value : null,
                      })
                    }
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">-- Không có (Đây là danh mục gốc) --</option>
                    {categories
                      .filter((c) => !editingCategory || c._id !== editingCategory._id)
                      .map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Trạng thái hoạt động */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-input"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                    Kích hoạt danh mục này (Cho phép hiển thị trên cửa hàng)
                  </label>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={closeForm} disabled={isSaving}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isSaving} className="gap-2">
                    {isSaving && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {editingCategory ? "Lưu thay đổi" : "Tạo danh mục"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Xác nhận Xóa */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
              <h3 className="text-lg font-semibold text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Xác nhận xóa danh mục
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Bạn có chắc chắn muốn xóa danh mục{" "}
                <span className="font-semibold text-foreground">"{deleteTarget.name}"</span>?
                Hành động này sẽ xóa danh mục khỏi hệ thống.
              </p>

              {deleteError && (
                <div className="mt-3 p-3 text-sm rounded bg-destructive/15 text-destructive">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteTarget(null)
                    setDeleteError(null)
                  }}
                  disabled={deleteMutation.isPending}
                >
                  Hủy bỏ
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(deleteTarget._id)}
                  disabled={deleteMutation.isPending}
                  className="gap-2"
                >
                  {deleteMutation.isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  Xác nhận xóa
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  )
}
