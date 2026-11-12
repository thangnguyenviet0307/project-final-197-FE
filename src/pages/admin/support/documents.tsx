import { LoadingSkeleton } from '@/components/loading-skeleton';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  Pencil,
  Plus,
  Trash2,
  FileText,
  Globe,
  FilePenLine,
} from 'lucide-react';
import { BaseLayout } from '@/layout/admin/base-layout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { managedDocuments } from '@/features/support/utils/managed-documents';
import {
  useManagedDocuments,
  useDocumentMutations,
} from '@/features/support/hooks/use-managed-documents';
import type { ManagedDocument } from '@/features/support/types/managed-document';
import { getApiError } from '@/services/api';

export default function DocumentsPage() {
  const query = useManagedDocuments();
  const mutations = useDocumentMutations();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [deleting, setDeleting] = useState<ManagedDocument | null>(null);
  const [conflict, setConflict] = useState(false);
  const rows = managedDocuments.map((document) => ({
    ...document,
    data: query.data?.find((item) => item.key === document.key),
  }));
  const published = rows.filter((row) => row.data?.publishedContent).length;
  const date = (value?: string | null) =>
    value ? new Date(value).toLocaleString('vi-VN') : '—';
  return (
    <BaseLayout
      title="Tất cả chính sách"
      description="Quản lý chính sách và thông tin cửa hàng."
    >
      <div className="mx-4 space-y-6 lg:mx-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: 'Tổng số mục', value: rows.length, Icon: FileText },
            {
              title: 'Đã công bố',
              value: query.data ? published : '—',
              Icon: Globe,
            },
            {
              title: 'Chưa công bố',
              value: query.data ? rows.length - published : '—',
              Icon: FilePenLine,
            },
          ].map(({ title, value, Icon }) => (
            <Card key={title}>
              <CardContent className="flex items-center justify-between pt-5">
                <div>
                  <p className="text-muted-foreground text-sm">{title}</p>
                  <p className="mt-1 text-2xl font-semibold">{value}</p>
                </div>
                <Icon className="text-muted-foreground size-6" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Input
            className="max-w-sm"
            aria-label="Tìm chính sách"
            placeholder="Tìm chính sách, thông tin…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            aria-label="Trạng thái"
            className="bg-background rounded-lg border px-3 text-sm"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã công bố</option>
            <option value="draft">Chưa công bố</option>
          </select>
          <Button
            variant="outline"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            Làm mới
          </Button>
        </div>
        {query.isPending ? (
          <LoadingSkeleton label="Đang tải danh sách…" variant="table" />
        ) : query.isError ? (
          <div role="alert">
            <p>{getApiError(query.error).message}</p>
            <Button onClick={() => void query.refetch()}>Thử lại</Button>
          </div>
        ) : (
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày đăng</TableHead>
                  <TableHead>Cập nhật</TableHead>
                  <TableHead>Lượt xem</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows
                  .filter(
                    (row) =>
                      row.title
                        .toLocaleLowerCase('vi')
                        .includes(search.trim().toLocaleLowerCase('vi')) &&
                      (status === 'all' ||
                        (status === 'published') ===
                          !!row.data?.publishedContent)
                  )
                  .map((row) => (
                    <TableRow key={row.key}>
                      <TableCell>
                        <Link
                          className="font-medium hover:underline"
                          to={`/auth/policies/${row.key}`}
                        >
                          {row.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.data?.publishedContent ? 'default' : 'secondary'
                          }
                        >
                          {row.data?.publishedContent
                            ? row.data.content !== row.data.publishedContent
                              ? 'Có thay đổi chưa công bố'
                              : 'Đã công bố'
                            : row.data?.content
                              ? 'Bản nháp'
                              : 'Chưa có nội dung'}
                        </Badge>
                      </TableCell>
                      <TableCell>{date(row.data?.publishedAt)}</TableCell>
                      <TableCell>{date(row.data?.updatedAt)}</TableCell>
                      <TableCell>{row.data?.views ?? 0}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {row.data?.publishedContent && (
                            <Link
                              className={buttonVariants({
                                variant: 'ghost',
                                size: 'icon',
                              })}
                              aria-label={`Xem ${row.title}`}
                              title="Xem trên website"
                              to={row.path}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Eye />
                            </Link>
                          )}
                          <Link
                            className={buttonVariants({
                              variant: 'ghost',
                              size: 'icon',
                            })}
                            aria-label={`${row.data?.content ? 'Sửa' : 'Thêm'} ${row.title}`}
                            title={
                              row.data?.content
                                ? 'Sửa nội dung'
                                : 'Thêm nội dung'
                            }
                            to={`/auth/policies/${row.key}`}
                          >
                            {row.data?.content ? <Pencil /> : <Plus />}
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Xóa ${row.title}`}
                            title="Xóa nội dung"
                            disabled={
                              !row.data?.content && !row.data?.publishedContent
                            }
                            onClick={() => {
                              mutations.remove.reset();
                              setConflict(false);
                              setDeleting(row.data ?? null);
                            }}
                          >
                            <Trash2 className="text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                {!rows.some(
                  (row) =>
                    row.title
                      .toLocaleLowerCase('vi')
                      .includes(search.trim().toLocaleLowerCase('vi')) &&
                    (status === 'all' ||
                      (status === 'published') === !!row.data?.publishedContent)
                ) && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center">
                      Không tìm thấy nội dung phù hợp.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
        <p className="text-muted-foreground text-sm">
          Chọn “Thêm” ở mục chưa có nội dung để soạn bài mới. Xóa sẽ gỡ bài công
          khai, bản nháp và đặt lại thống kê của mục đó; các mục khác được giữ
          nguyên.
        </p>
        {deleting && (
          <Dialog
            open
            onOpenChange={(open) => {
              if (!open && !mutations.remove.isPending) setDeleting(null);
            }}
          >
            <DialogContent showCloseButton={!mutations.remove.isPending}>
              <DialogHeader>
                <DialogTitle>Xóa nội dung?</DialogTitle>
                <DialogDescription>
                  Xóa “
                  {
                    managedDocuments.find((item) => item.key === deleting.key)
                      ?.title
                  }
                  ”? Nội dung sẽ bị gỡ khỏi website. Khi đăng lại, ngày đăng và
                  lượt xem sẽ bắt đầu lại.
                </DialogDescription>
              </DialogHeader>
              {mutations.remove.error && (
                <p role="alert" className="text-destructive">
                  {getApiError(mutations.remove.error).message}
                </p>
              )}
              {conflict && (
                <p role="alert">
                  Dữ liệu đã thay đổi. Hãy đóng hộp thoại và làm mới danh sách
                  trước khi kiểm tra lại.
                </p>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  disabled={mutations.remove.isPending}
                  onClick={() => setDeleting(null)}
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  disabled={mutations.remove.isPending || conflict}
                  onClick={() =>
                    mutations.remove.mutate(
                      { key: deleting.key, expectedVersion: deleting.__v },
                      {
                        onSuccess: () => setDeleting(null),
                        onError: (failure) => {
                          if (getApiError(failure).statusCode === 409)
                            setConflict(true);
                        },
                      }
                    )
                  }
                >
                  Xác nhận xóa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </BaseLayout>
  );
}
