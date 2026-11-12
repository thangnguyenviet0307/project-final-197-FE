import { LoadingSkeleton } from '@/components/loading-skeleton';
import { Link, useLocation } from 'react-router-dom';
import { ContentBody } from '@/features/support/components/content';
import { PublicationFooter } from '@/features/support/components/publication-footer';
import {
  usePublicDocument,
  useDocumentView,
} from '@/features/support/hooks/use-managed-documents';
import { managedDocuments } from '@/features/support/utils/managed-documents';
import { StoreInformationLayout } from '@/features/support/components/store-information-layout';
import { Button } from '@/components/ui/button';
import { getApiError } from '@/services/api';

export default function StoreDocumentPage() {
  const location = useLocation();
  const document = managedDocuments.find(
    (item) => item.path === location.pathname.replace(/\/$/, '')
  );
  const query = usePublicDocument(document?.key ?? '');
  useDocumentView(
    document?.key ?? '',
    !!query.data?.content && query.isSuccess,
    location.key
  );
  if (!document) return <p>Không tìm thấy trang.</p>;
  return (
    <StoreInformationLayout
      title={document.title}
      description={document.description}
      path={document.path}
    >
      {query.isPending ? (
        <LoadingSkeleton label="Đang tải nội dung…" variant="text" />
      ) : query.isError ? (
        <div role="alert">
          <p>{getApiError(query.error).message}</p>
          <Button variant="outline" onClick={() => void query.refetch()}>
            Thử lại
          </Button>
        </div>
      ) : query.data?.content ? (
        <>
          <ContentBody value={query.data.content} />
          <PublicationFooter publication={query.data} />
        </>
      ) : (
        <p>Nội dung đang được cập nhật.</p>
      )}
      {document.key === 'warranty' && (
        <Link
          to="/account/warranty"
          className="mt-6 inline-flex rounded-full bg-[#65b719] px-6 py-3 font-semibold text-white"
        >
          Gửi yêu cầu bảo hành
        </Link>
      )}
    </StoreInformationLayout>
  );
}
