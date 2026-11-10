import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BaseLayout } from '@/layout/admin/base-layout';
import { Button } from '@/components/ui/button';
import { pendingInformationPages } from '@/features/support/utils/policy-documents';
import { ContentEditor } from '@/features/support/components/content';
import {
  useAdminInformation,
  useSaveInformation,
} from '@/features/support/hooks/use-information';
import type { Information } from '@/features/support/services/information.service';
import { saveInformationSchema } from '@/features/support/schemas/information-schema';
import { useUnsavedForm } from '@/hooks/use-unsaved-form';
import { getApiError } from '@/services/api';

function Editor({
  initial,
  slug,
  title,
  reload,
}: {
  initial: Information;
  slug: string;
  title: string;
  reload: () => Promise<void>;
}) {
  const [baseline, setBaseline] = useState(initial);
  const [content, setContent] = useState(initial.content);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [conflict, setConflict] = useState(false);
  const mutation = useSaveInformation();
  const navigation = useUnsavedForm(
    content !== baseline.content || mutation.isPending
  );
  async function save(publish: boolean) {
    const parsed = saveInformationSchema.safeParse({
      content,
      publish,
      expectedVersion: baseline.__v,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError('');
    setMessage('');
    try {
      const saved = await mutation.mutateAsync({ slug, ...parsed.data });
      setBaseline(saved);
      setContent(saved.content);
      setMessage(
        publish ? 'Đã công bố nội dung lên website.' : 'Đã lưu bản nháp.'
      );
    } catch (failure) {
      const detail = getApiError(failure);
      setError(detail.message);
      if (detail.statusCode === 409) setConflict(true);
    }
  }
  return (
    <div className="space-y-4">
      <p>
        {baseline.publishedAt
          ? `Lần công bố gần nhất: ${new Date(baseline.publishedAt).toLocaleString('vi-VN')}`
          : 'Chưa có nội dung được công bố.'}
      </p>
      <ContentEditor
        requiredOnPublish
        label={title}
        value={content}
        onChange={(value) => {
          setContent(value);
          setMessage('');
        }}
        disabled={mutation.isPending}
      />
      <p className="text-muted-foreground text-sm">
        {content.length}/30000 ký tự, bao gồm định dạng. FAQ có thể trình bày
        bằng tiêu đề câu hỏi và phần trả lời.
      </p>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      {conflict && (
        <p role="alert">
          Nội dung đã thay đổi. Bản nhập được giữ lại; hãy sao chép nếu cần
          trước khi tải bản mới để kiểm tra.
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={mutation.isPending || conflict}
          onClick={() => void save(false)}
        >
          Lưu bản nháp
        </Button>
        <Button
          disabled={mutation.isPending || conflict}
          onClick={() => void save(true)}
        >
          Công bố
        </Button>
        <Button
          variant="outline"
          disabled={mutation.isPending}
          onClick={() => navigation.confirmDiscard(() => void reload())}
        >
          Tải bản mới
        </Button>
        <Link to={`/${slug}`} target="_blank" rel="noreferrer">
          Xem trang công khai
        </Link>
      </div>
      {navigation.guard}
    </div>
  );
}
export default function AdminInformationPage() {
  const { pathname } = useLocation();
  const document = pendingInformationPages.find(
    (item) => pathname === `/auth/policies/${item.slug}`
  );
  const query = useAdminInformation(document?.slug ?? '');
  const [session, setSession] = useState(0);
  const [error, setError] = useState('');
  async function reload() {
    const result = await query.refetch();
    if (result.isSuccess) {
      setError('');
      setSession((value) => value + 1);
    } else setError(getApiError(result.error).message);
  }
  if (!document) return <p>Không tìm thấy trang.</p>;
  return (
    <BaseLayout
      title={document.title}
      description="Soạn thảo, lưu nháp và công bố nội dung cửa hàng."
    >
      <div className="mx-4 max-w-4xl space-y-4 lg:mx-6">
        {error && <p role="alert">{error}</p>}
        {query.data ? (
          <Editor
            key={`${document.slug}:${session}`}
            initial={query.data}
            slug={document.slug}
            title={document.title}
            reload={reload}
          />
        ) : query.isError ? (
          <div role="alert">
            <p>{getApiError(query.error).message}</p>
            <Button onClick={() => void query.refetch()}>Thử lại</Button>
          </div>
        ) : (
          <p role="status">Đang tải nội dung…</p>
        )}
      </div>
    </BaseLayout>
  );
}
