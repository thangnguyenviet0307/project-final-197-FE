import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BaseLayout } from '@/layout/admin/base-layout';
import { Button } from '@/components/ui/button';
import { managedDocuments } from '@/features/support/utils/managed-documents';
import {
  ContentEditor,
  ContentBody,
} from '@/features/support/components/content';
import { PublicationFooter } from '@/features/support/components/publication-footer';
import {
  useManagedDocument,
  useDocumentMutations,
} from '@/features/support/hooks/use-managed-documents';
import type { ManagedDocument } from '@/features/support/types/managed-document';
import { saveInformationSchema } from '@/features/support/schemas/information-schema';
import { useUnsavedForm } from '@/hooks/use-unsaved-form';
import { getApiError } from '@/services/api';

function Editor({
  initial,
  title,
  path,
  reload,
}: {
  initial: ManagedDocument;
  title: string;
  path: string;
  reload: () => Promise<void>;
}) {
  const [baseline, setBaseline] = useState(initial);
  const [content, setContent] = useState(initial.content);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [conflict, setConflict] = useState(false);
  const [preview, setPreview] = useState(false);
  const mutation = useDocumentMutations().save;
  const navigation = useUnsavedForm(
    content !== baseline.content || mutation.isPending
  );
  const maxLength = 30000;
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
    if (parsed.data.content.length > maxLength) {
      setError(`Nội dung tối đa ${maxLength} ký tự bao gồm định dạng.`);
      return;
    }
    setError('');
    setMessage('');
    try {
      const saved = await mutation.mutateAsync({
        key: initial.key,
        ...parsed.data,
      });
      setBaseline(saved);
      setContent(saved.content);
      setMessage(
        publish
          ? 'Đã công bố nội dung này lên website.'
          : 'Đã lưu bản nháp. Nội dung công khai chưa thay đổi.'
      );
    } catch (failure) {
      const detail = getApiError(failure);
      setError(detail.message);
      if (detail.statusCode === 409) setConflict(true);
    }
  }
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/auth/policies" className="text-sm underline">
          ← Tất cả chính sách
        </Link>
        <Button variant="outline" onClick={() => setPreview((value) => !value)}>
          {preview ? 'Tiếp tục soạn thảo' : 'Xem trước bản đang soạn'}
        </Button>
      </div>
      <p className="bg-muted/30 text-muted-foreground rounded-lg border p-4 text-sm">
        Lưu và công bố chỉ áp dụng cho “{title}”. Ngày đăng được giữ nguyên khi
        cập nhật; ngày cập nhật chỉ đổi khi nội dung công bố thay đổi.
      </p>
      {preview ? (
        <article className="rounded-xl border p-6">
          <h2 className="mb-5 text-2xl font-bold">{title}</h2>
          <ContentBody value={content} />
          <PublicationFooter publication={baseline} />
        </article>
      ) : (
        <ContentEditor
          label={title}
          value={content}
          onChange={(value) => {
            setContent(value);
            setMessage('');
          }}
          disabled={mutation.isPending}
        />
      )}
      <p className="text-muted-foreground text-sm">
        {content.length}/{maxLength} ký tự, bao gồm định dạng.
      </p>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
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
          {baseline.publishedContent ? 'Cập nhật lên web' : 'Công bố lên web'}
        </Button>
        <Button
          variant="outline"
          disabled={mutation.isPending}
          onClick={() => navigation.confirmDiscard(() => void reload())}
        >
          Tải bản mới
        </Button>
        {baseline.publishedContent && (
          <Link
            className="self-center text-sm underline"
            to={path}
            target="_blank"
            rel="noreferrer"
          >
            Xem trang công khai
          </Link>
        )}
      </div>
      {navigation.guard}
    </div>
  );
}
export default function DocumentEditorPage() {
  const { pathname } = useLocation();
  const document = managedDocuments.find(
    (item) => pathname.replace(/\/$/, '') === `/auth/policies/${item.key}`
  );
  const query = useManagedDocument(document?.key ?? '');
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
      <div className="mx-4 max-w-5xl space-y-4 lg:mx-6">
        {error && <p role="alert">{error}</p>}
        {query.data ? (
          <Editor
            key={`${document.key}:${session}`}
            initial={query.data}
            title={document.title}
            path={document.path}
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
