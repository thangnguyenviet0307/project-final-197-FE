import { LoadingSkeleton } from '@/components/loading-skeleton';
import { POLICY_SECTION_MAX_LENGTH } from '@/constants/text-limits';
import { RequiredMark } from '@/components/required-mark';
import { ContentEditor } from '@/features/support/components/content';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BaseLayout } from '@/layout/admin/base-layout';
import { Button } from '@/components/ui/button';
import {
  useAdminPolicy,
  useSupportMutations,
} from '@/features/support/hooks/use-support';
import type { AdminPolicy } from '@/features/support/types/support';
import { policySections, supportDate } from '@/features/support/utils/support';
import {
  policyDocuments,
  policySuggestions,
} from '@/features/support/utils/policy-documents';
import { savePolicySchema } from '@/features/support/schemas/support-schema';
import { getApiError } from '@/services/api';
import { useUnsavedForm } from '@/hooks/use-unsaved-form';

function PolicyEditor({
  initial,
  reload,
}: {
  initial: AdminPolicy;
  reload: () => Promise<void>;
}) {
  const { pathname } = useLocation();
  const document = policyDocuments.find(
    (item) => pathname === `/auth/policies/${item.key}`
  );
  const [baseline, setBaseline] = useState(() => ({
    ...initial,
    content: { ...initial.content, privacy: initial.content.privacy ?? '' },
  }));
  const [content, setContent] = useState(() => ({
    ...initial.content,
    privacy: initial.content.privacy ?? '',
  }));
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [conflict, setConflict] = useState(false);
  const mutations = useSupportMutations();
  const dirty = JSON.stringify(content) !== JSON.stringify(baseline.content);
  const navigation = useUnsavedForm(dirty);
  async function save(publish: boolean) {
    const parsed = savePolicySchema.safeParse({
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
      const saved = await mutations.savePolicy.mutateAsync(parsed.data);
      setBaseline(saved);
      setContent(saved.content);
      setMessage(
        publish
          ? 'Đã công bố chính sách lên website.'
          : 'Đã lưu bản nháp. Bản công khai được giữ đến lần công bố tiếp theo.'
      );
    } catch (failure) {
      const apiError = getApiError(failure);
      setError(apiError.message);
      if (apiError.statusCode === 409) setConflict(true);
    }
  }
  return (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-xl border p-5">
        <p>
          Nhập chính sách thực tế của cửa hàng. Thông tin riêng trên từng sản
          phẩm cần thống nhất với nội dung này.
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          {baseline.publishedAt
            ? `Lần công bố gần nhất: ${supportDate(baseline.publishedAt)}`
            : 'Chưa có chính sách được công bố.'}
        </p>
        <p className="text-muted-foreground mt-3 text-sm">
          Nội dung gợi ý cần được rà soát và bổ sung phạm vi chia sẻ dữ liệu,
          thời hạn lưu trữ, điều kiện giao hàng và đổi trả thực tế trước khi
          công bố. Chỉ những mục đang trống được điền.
        </p>
        <Button
          className="mt-3"
          variant="outline"
          disabled={mutations.savePolicy.isPending || conflict}
          onClick={() => {
            setContent((current) => ({
              ...current,
              ...Object.fromEntries(
                Object.entries(policySuggestions).filter(
                  ([key]) =>
                    (!document || key === document.key) &&
                    !current[key as keyof typeof current].trim()
                )
              ),
            }));
            setMessage(
              'Đã chèn gợi ý vào các mục đang trống. Hãy rà soát trước khi lưu hoặc công bố.'
            );
          }}
        >
          Chèn gợi ý bảo mật, giao hàng và đổi trả
        </Button>
      </div>
      {document && (
        <p className="text-muted-foreground text-sm">
          Bạn đang soạn {document.title.toLowerCase()}. Lưu và công bố áp dụng
          cho toàn bộ bản chính sách, bao gồm các mục khác trong bản nháp.{' '}
          <Link to="/auth/policies" className="underline">
            Kiểm tra tất cả chính sách
          </Link>
        </p>
      )}
      {policySections
        .filter((section) => !document || section.key === document.key)
        .map((section) => (
          <div key={section.key}>
            <label htmlFor={section.key} className="font-semibold">
              {section.title}
              <RequiredMark />
            </label>
            <p className="text-muted-foreground text-xs">
              Bắt buộc khi công bố; có thể để trống khi lưu bản nháp.
            </p>
            <p
              id={`${section.key}-hint`}
              className="text-muted-foreground my-2 text-sm"
            >
              {section.hint}
            </p>
            <ContentEditor
              label={section.title}
              value={content[section.key]}
              disabled={mutations.savePolicy.isPending}
              onChange={(value) => {
                setContent({ ...content, [section.key]: value });
                setMessage('');
              }}
            />
            <p className="text-muted-foreground text-right text-xs">
              {content[section.key].length.toLocaleString('vi-VN')}/
              {POLICY_SECTION_MAX_LENGTH.toLocaleString('vi-VN')}
            </p>
          </div>
        ))}
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-emerald-700 dark:text-emerald-400">
          {message}
        </p>
      )}
      {conflict && (
        <p role="alert">
          Phiên bản đã thay đổi. Bản đang nhập được giữ lại; hãy sao chép nếu
          cần rồi tải bản mới để kiểm tra.
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={mutations.savePolicy.isPending || conflict}
          onClick={() => void save(false)}
        >
          Lưu bản nháp
        </Button>
        <Button
          disabled={mutations.savePolicy.isPending || conflict}
          onClick={() => void save(true)}
        >
          Công bố chính sách
        </Button>
        <Button
          variant="outline"
          disabled={mutations.savePolicy.isPending}
          onClick={() => navigation.confirmDiscard(() => void reload())}
        >
          Tải bản mới
        </Button>
        <Link
          to={document?.path ?? '/chinh-sach-bao-hanh'}
          target="_blank"
          rel="noreferrer"
          className="self-center text-sm underline"
        >
          Xem trang công khai
        </Link>
      </div>
      {navigation.guard}
    </div>
  );
}
export default function AdminPolicyPage() {
  const { pathname } = useLocation();
  const document = policyDocuments.find(
    (item) => pathname === `/auth/policies/${item.key}`
  );
  const query = useAdminPolicy();
  const [session, setSession] = useState(0);
  const [reloadError, setReloadError] = useState('');
  async function reload() {
    const result = await query.refetch();
    if (result.isSuccess) {
      setReloadError('');
      setSession((value) => value + 1);
    } else setReloadError(getApiError(result.error).message);
  }
  return (
    <BaseLayout
      title={document?.title ?? 'Chính sách cửa hàng'}
      description="Soạn nội dung và công bố chính sách mua hàng."
    >
      <div className="mx-4 max-w-4xl lg:mx-6">
        {reloadError && <p role="alert">{reloadError}</p>}
        {query.data ? (
          <PolicyEditor key={session} initial={query.data} reload={reload} />
        ) : query.isError ? (
          <div role="alert">
            <p>{getApiError(query.error).message}</p>
            <Button onClick={() => void query.refetch()}>Thử lại</Button>
          </div>
        ) : (
          <LoadingSkeleton label="Đang tải chính sách…" variant="form" />
        )}
      </div>
    </BaseLayout>
  );
}
