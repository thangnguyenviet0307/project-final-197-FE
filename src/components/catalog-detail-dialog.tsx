import { CatalogImage } from '@/components/catalog-image';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CatalogDetail {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function CatalogDetailDialog({
  record,
  title,
  image,
  parentName,
  childNames,
  onClose,
}: {
  record: CatalogDetail | null;
  title: string;
  image?: string;
  parentName?: string;
  childNames?: string[];
  onClose: () => void;
}) {
  const date = (value?: string) =>
    value && !Number.isNaN(Date.parse(value))
      ? new Date(value).toLocaleString('vi-VN')
      : 'Chưa cung cấp';
  const details = record
    ? [
        ['Mã', record._id],
        ['Tên', record.name],
        ['Đường dẫn', record.slug],
        ['Mô tả', record.description],
        ...(parentName !== undefined ? [['Danh mục cha', parentName]] : []),
        ...(childNames !== undefined
          ? [['Danh mục con', childNames.join('\n') || 'Không có']]
          : []),
        ['Ngày tạo', date(record.createdAt)],
        ['Cập nhật lần cuối', date(record.updatedAt)],
      ]
    : [];
  return (
    <Dialog
      open={!!record}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết của {record?.name}.
          </DialogDescription>
        </DialogHeader>
        {record && (
          <>
            <div className="bg-muted/50 flex min-w-0 items-center gap-4 rounded-lg p-4">
              <CatalogImage src={image} alt={record.name} />
              <p className="min-w-0 font-semibold wrap-break-word">
                {record.name}
              </p>
            </div>
            <dl className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              {details.map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-muted-foreground text-xs">{label}</dt>
                  <dd className="mt-1 text-sm wrap-break-word whitespace-pre-wrap">
                    {value?.trim() || 'Chưa cung cấp'}
                  </dd>
                </div>
              ))}
              <div>
                <dt className="text-muted-foreground text-xs">Trạng thái</dt>
                <dd className="mt-1">
                  <Badge variant={record.isActive ? 'default' : 'secondary'}>
                    {record.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                  </Badge>
                </dd>
              </div>
            </dl>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
