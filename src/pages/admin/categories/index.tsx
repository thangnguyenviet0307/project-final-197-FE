import { isAdministrator } from '@/features/auth/utils/roles';
import { DeleteCategoryDialog } from '@/features/categories/components/delete-category-dialog';
import { Link } from 'react-router-dom';
import { CatalogImage } from '@/components/catalog-image';
import { CatalogDetailDialog } from '@/components/catalog-detail-dialog';
import { detailRow } from '@/utils/detail-row';
import { categoryParentName } from '@/features/categories/utils/category-parent';
import { CategoryForm } from '@/features/categories/components/category-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/auth.store';
import { ContentSkeleton } from '@/components/page-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo } from 'react';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { useUpdateCategory } from '@/features/categories/hooks/use-update-category';
import type { Category } from '@/features/categories/types/categories';
import { getApiError } from '@/services/api';
import { BaseLayout } from '@/layout/admin/base-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { ListPagination } from '@/components/list-pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FolderTree,
  FolderPlus,
  Pencil,
  Trash2,
  CheckCircle2,
  Folder,
  Layers,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const canManage = useAuthStore((state) => isAdministrator(state.user?.role));
  const {
    data: categories = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useCategories();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [hierarchyFilter, setHierarchyFilter] = useState('all');
  const [detailId, setDetailId] = useState<string | null>(null);
  const detail =
    categories.find((category) => category._id === detailId) ?? null;
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');

  const [page, setPage] = useState(1);
  const limit = 10;

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const updateMutation = useUpdateCategory();

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.description || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? cat.isActive
            : !cat.isActive;

      const matchesHierarchy =
        hierarchyFilter === 'all' ||
        (hierarchyFilter === 'root' ? !cat.parent : !!cat.parent);
      return matchesSearch && matchesStatus && matchesHierarchy;
    });
  }, [categories, searchTerm, statusFilter, hierarchyFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.isActive).length;
    const root = categories.filter((c) => !c.parent).length;
    const sub = total - root;
    return { total, active, root, sub };
  }, [categories]);

  const isSaving = updateMutation.isPending;
  const childrenByParent = useMemo(() => {
    const children = new Map<string, Category[]>();
    for (const category of categories) {
      const parentId =
        typeof category.parent === 'object'
          ? category.parent?._id
          : category.parent;
      if (!parentId) continue;
      const siblings = children.get(parentId) ?? [];
      siblings.push(category);
      children.set(parentId, siblings);
    }
    return children;
  }, [categories]);

  const cards = [
    {
      label: 'Tổng danh mục',
      value: stats.total,
      Icon: Folder,
      color: 'text-muted-foreground',
    },
    {
      label: 'Danh mục đang hoạt động',
      value: stats.active,
      Icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Danh mục gốc',
      value: stats.root,
      Icon: Layers,
      color: 'text-primary',
    },
    {
      label: 'Danh mục con',
      value: stats.sub,
      Icon: FolderTree,
      color: 'text-muted-foreground',
    },
  ];
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / limit));
  const currentPage = Math.min(page, totalPages);
  const visibleCategories = filteredCategories.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  return (
    <BaseLayout
      title="Danh mục"
      description="Quản lý danh mục sản phẩm và cấu trúc phân cấp."
    >
      <div className="space-y-4 px-4 lg:px-6">
        <section
          aria-label="Thống kê danh mục"
          className="grid grid-cols-2 gap-4 md:grid-cols-4"
          aria-busy={isFetching}
        >
          {cards.map(({ label, value, Icon, color }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-muted-foreground text-xs font-medium uppercase">
                  {label}
                </CardTitle>
                <Icon className={`size-4 shrink-0 ${color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${color}`}>
                  {isLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : error ? (
                    '-'
                  ) : (
                    value
                  )}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Tất cả danh mục
                </p>
              </CardContent>
            </Card>
          ))}
        </section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">
            {filteredCategories.length} danh mục
          </p>
          {canManage && (
            <Button
              nativeButton={false}
              role="link"
              render={<Link to="/auth/categories/new" />}
            >
              <FolderPlus />
              Thêm danh mục
            </Button>
          )}
        </div>
        <section
          aria-label="Bộ lọc danh mục"
          className="space-y-3 rounded-lg border p-4"
        >
          <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field className="lg:col-span-2">
              <FieldLabel htmlFor="category-search">Tên danh mục</FieldLabel>
              <Input
                id="category-search"
                placeholder="Tìm theo tên, đường dẫn hoặc mô tả"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setPage(1);
                }}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="category-status">Trạng thái</FieldLabel>
              <select
                id="category-status"
                className="bg-background h-8 rounded-md border px-2 text-sm"
                value={statusFilter}
                onChange={(event) => {
                  const value = event.target.value;
                  if (
                    value === 'all' ||
                    value === 'active' ||
                    value === 'inactive'
                  ) {
                    setStatusFilter(value);
                    setPage(1);
                  }
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Ngừng hoạt động</option>
              </select>
            </Field>
            <Field>
              <FieldLabel htmlFor="category-hierarchy">
                Loại danh mục
              </FieldLabel>
              <select
                id="category-hierarchy"
                className="bg-background h-8 rounded-md border px-2 text-sm"
                value={hierarchyFilter}
                onChange={(event) => {
                  setHierarchyFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Tất cả danh mục</option>
                <option value="root">Danh mục gốc</option>
                <option value="child">Danh mục con</option>
              </select>
            </Field>
            <Button
              type="button"
              variant="outline"
              className="sm:col-span-2 lg:col-span-4 lg:justify-self-end"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setHierarchyFilter('all');
                setPage(1);
              }}
            >
              Đặt lại bộ lọc
            </Button>
          </div>
        </section>
        {isLoading ? (
          <ContentSkeleton label="Đang tải danh mục" />
        ) : error ? (
          <div role="alert" className="space-y-3">
            <p>{getApiError(error).message}</p>
            <Button variant="outline" onClick={() => void refetch()}>
              Tải lại danh mục
            </Button>
          </div>
        ) : (
          <>
            {isFetching && (
              <p role="status" className="text-muted-foreground text-sm">
                Đang cập nhật danh mục...
              </p>
            )}
            {!visibleCategories.length ? (
              <div className="grid justify-items-center gap-3 rounded-lg border py-12">
                <FolderTree className="text-muted-foreground size-8" />
                <p>Không tìm thấy danh mục.</p>
              </div>
            ) : (
              <div
                className="overflow-hidden rounded-lg border"
                aria-busy={isFetching}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      {[
                        'Danh mục',
                        'Danh mục cha',
                        'Danh mục con',
                        'Trạng thái',
                        'Thao tác',
                      ].map((label) => (
                        <TableHead key={label}>{label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleCategories.map((category) => {
                      const parentName = categoryParentName(
                        category,
                        categories
                      );
                      const children = childrenByParent.get(category._id) ?? [];
                      return (
                        <TableRow
                          key={category._id}
                          {...detailRow(() => setDetailId(category._id))}
                          aria-label={`Xem danh mục ${category.name}`}
                        >
                          <TableCell>
                            <div className="flex max-w-80 min-w-48 items-center gap-3">
                              <CatalogImage
                                src={category.icon}
                                alt={category.name}
                              />
                              <span
                                className="truncate font-medium"
                                title={category.name}
                              >
                                {category.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-56 text-sm wrap-break-word whitespace-normal">
                            {parentName}
                          </TableCell>
                          <TableCell className="max-w-80 min-w-48 whitespace-normal">
                            {children.length ? (
                              <div className="space-y-1">
                                <span className="text-muted-foreground text-xs">
                                  {children.length} danh mục con
                                </span>
                                <ul
                                  className="space-y-0.5 text-sm"
                                  aria-label={`Danh mục con của ${category.name}`}
                                >
                                  {children.slice(0, 2).map((child) => (
                                    <li
                                      key={child._id}
                                      className="max-w-64 truncate"
                                      title={child.name}
                                    >
                                      {child.name}
                                    </li>
                                  ))}
                                </ul>
                                {children.length > 2 && (
                                  <span className="text-muted-foreground text-xs">
                                    +{children.length - 2} danh mục khác
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                Không có
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                category.isActive ? 'default' : 'secondary'
                              }
                            >
                              {category.isActive
                                ? 'Đang hoạt động'
                                : 'Ngừng hoạt động'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {canManage && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Edit ${category.name}`}
                                    title="Chỉnh sửa danh mục"
                                    onClick={() => setEditingCategory(category)}
                                  >
                                    <Pencil />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Delete ${category.name}`}
                                    title="Xóa danh mục"
                                    onClick={() => setDeleteTarget(category)}
                                  >
                                    <Trash2 className="text-destructive" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            <ListPagination
              label="Phân trang danh mục"
              page={currentPage}
              totalPages={totalPages}
              disabled={isFetching}
              onPageChange={setPage}
            />
          </>
        )}

        <Dialog
          open={!!editingCategory}
          onOpenChange={(open) => {
            if (!open && !isSaving) setEditingCategory(null);
          }}
        >
          <DialogContent
            showCloseButton={!isSaving}
            className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"
          >
            <DialogHeader>
              <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin và ảnh đại diện danh mục.
              </DialogDescription>
            </DialogHeader>
            {editingCategory && (
              <CategoryForm
                key={editingCategory._id}
                category={editingCategory}
                onCancel={() => setEditingCategory(null)}
                onSubmit={async (input) => {
                  await updateMutation.mutateAsync({
                    id: editingCategory._id,
                    input,
                  });
                  setEditingCategory(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        <CatalogDetailDialog
          record={detail}
          childNames={
            detail
              ? (childrenByParent.get(detail._id) ?? []).map(
                  (child) => child.name
                )
              : undefined
          }
          title="Chi tiết danh mục"
          image={detail?.icon}
          parentName={
            detail ? categoryParentName(detail, categories) : undefined
          }
          onClose={() => setDetailId(null)}
        />

        {deleteTarget && canManage && (
          <DeleteCategoryDialog
            key={deleteTarget._id}
            category={deleteTarget}
            onClose={() => setDeleteTarget(null)}
          />
        )}
      </div>
    </BaseLayout>
  );
}
