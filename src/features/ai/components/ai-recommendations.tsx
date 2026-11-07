import { useAiRecommendations } from '../hooks/use-ai-products';
import { AiProducts } from './ai-products';
export function AiRecommendations({ slug }: { slug: string }) {
  const result = useAiRecommendations(slug);
  return (
    <section className="space-y-4" aria-label="Gợi ý theo sản phẩm đang xem">
      <h2 className="text-xl font-bold">Lựa chọn tương tự dành cho bạn</h2>
      {result.isPending ? (
        <p role="status">Đang tìm sản phẩm tương tự…</p>
      ) : result.isError ? (
        <p role="alert">
          Chưa tải được gợi ý.{' '}
          <button onClick={() => void result.refetch()}>Thử lại</button>
        </p>
      ) : result.data?.length ? (
        <AiProducts products={result.data} />
      ) : (
        <p>Chưa có lựa chọn tương tự.</p>
      )}
    </section>
  );
}
