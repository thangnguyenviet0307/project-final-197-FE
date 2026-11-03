import { ContentBody } from '@/features/support/components/content';
import { useInformation } from '@/features/support/hooks/use-information';
import { getApiError } from '@/services/api';
import { Link, useLocation } from 'react-router-dom';
import { pendingInformationPages } from '@/features/support/utils/policy-documents';
import { StoreInformationLayout } from '@/features/support/components/store-information-layout';

export default function InformationPlaceholderPage() {
  const { pathname } = useLocation();
  const document = pendingInformationPages.find(
    (item) => pathname.replace(/\/$/, '') === `/${item.slug}`
  );
  const query = useInformation(document?.slug ?? '');
  if (!document)
    return (
      <div className="store-container py-12">
        <Link to="/chinh-sach-bao-hanh">Xem chính sách cửa hàng</Link>
      </div>
    );
  return (
    <StoreInformationLayout
      title={document.title}
      description="Thông tin dành cho khách hàng của cửa hàng."
      path={`/${document.slug}`}
    >
      {query.isPending ? (
        <p role="status">Đang tải nội dung…</p>
      ) : query.isError ? (
        <div role="alert">
          <p>{getApiError(query.error).message}</p>
          <button onClick={() => void query.refetch()}>Thử lại</button>
        </div>
      ) : query.data?.content ? (
        <ContentBody value={query.data.content} />
      ) : (
        <p>Nội dung đang được cập nhật.</p>
      )}
    </StoreInformationLayout>
  );
}
