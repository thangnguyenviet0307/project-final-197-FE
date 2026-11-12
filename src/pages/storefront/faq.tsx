import { LoadingSkeleton } from '@/components/loading-skeleton';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, CircleHelp, Search } from 'lucide-react';
import { useFAQPageContent } from '@/features/storefront/hooks/use-storefront-page-content';
import { getApiError } from '@/services/api';

const allCategories = { id: 'all', label: 'Tất cả' };

export default function StorefrontFAQPage() {
  const query = useFAQPageContent();
  const [activeCategory, setActiveCategory] = useState(allCategories.id);
  const [search, setSearch] = useState('');

  const visibleCategories = useMemo(() => {
    const categories = query.data?.categories ?? [];
    const normalizedQuery = search.trim().toLocaleLowerCase('vi');

    return categories
      .filter(
        (category) =>
          activeCategory === allCategories.id || category.id === activeCategory
      )
      .map((category) => ({
        ...category,
        questions: category.questions.filter((item) =>
          `${item.question} ${item.answer}`
            .toLocaleLowerCase('vi')
            .includes(normalizedQuery)
        ),
      }))
      .filter((category) => category.questions.length > 0);
  }, [query.data?.categories, activeCategory, search]);

  if (query.isPending) {
    return (
      <main className="store-container py-20 text-center">
        <LoadingSkeleton
          label="Đang tải câu hỏi thường gặp..."
          variant="text"
        />
      </main>
    );
  }

  if (query.isError) {
    return (
      <main className="store-container py-20 text-center">
        <div role="alert" className="mx-auto max-w-lg">
          <p className="font-semibold text-gray-800">
            Không thể tải câu hỏi thường gặp.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            {getApiError(query.error).message}
          </p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="mt-4 font-semibold text-[#4d9210] underline"
          >
            Thử tải lại
          </button>
        </div>
      </main>
    );
  }

  const content = query.data;
  const visibleQuestionCount = visibleCategories.reduce(
    (total, category) => total + category.questions.length,
    0
  );

  return (
    <div className="bg-white text-gray-900">
      <section className="bg-[#223328] text-white">
        <div className="store-container py-12 sm:py-16">
          <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.24em] text-[#99df54] uppercase">
            <CircleHelp size={15} aria-hidden="true" />
            {content.eyebrow}
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            {content.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-300 sm:text-base">
            {content.intro}
          </p>
          <div className="mt-7 h-1 w-16 rounded-full bg-[#55b000]" />
        </div>
      </section>

      <section className="store-container py-10 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <div className="relative">
            <label htmlFor="faq-search" className="sr-only">
              Tìm câu hỏi
            </label>
            <Search
              size={19}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
            />
            <input
              id="faq-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Bạn muốn tìm hiểu điều gì?"
              className="w-full rounded-xl border border-gray-200 bg-white py-4 pr-4 pl-12 text-sm transition outline-none focus:border-[#55b000] focus:ring-4 focus:ring-[#55b000]/10"
            />
          </div>

          <div
            className="mt-5 flex flex-wrap gap-2"
            aria-label="Lọc câu hỏi theo chủ đề"
          >
            {[allCategories, ...content.categories].map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveCategory(category.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'border-[#55b000] bg-[#55b000] text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-[#55b000] hover:text-[#4d9210]'
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          <p className="mt-5 text-sm text-gray-500" aria-live="polite">
            {visibleQuestionCount > 0
              ? `${visibleQuestionCount} câu hỏi`
              : 'Không tìm thấy câu hỏi phù hợp'}
          </p>

          {visibleCategories.length > 0 ? (
            <div className="mt-8 space-y-10">
              {visibleCategories.map((category) => (
                <section
                  key={category.id}
                  aria-labelledby={`faq-${category.id}`}
                >
                  <h2
                    id={`faq-${category.id}`}
                    className="mb-4 text-xl font-bold sm:text-2xl"
                  >
                    {category.title}
                  </h2>
                  <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
                    {category.questions.map((item) => (
                      <details key={item.id} className="group px-5 sm:px-6">
                        <summary className="flex list-none items-center justify-between gap-4 py-5 text-left font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
                          <span>{item.question}</span>
                          <ChevronDown
                            size={19}
                            aria-hidden="true"
                            className="shrink-0 text-[#4d9210] transition-transform group-open:rotate-180"
                          />
                        </summary>
                        <div className="max-w-3xl pr-8 pb-5 text-sm leading-7 whitespace-pre-line text-gray-600">
                          {item.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-gray-300 px-6 py-12 text-center">
              <p className="font-semibold text-gray-800">
                Chưa có câu trả lời phù hợp
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Thử từ khóa khác hoặc xem toàn bộ chủ đề.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setActiveCategory(allCategories.id);
                }}
                className="mt-4 text-sm font-bold text-[#4d9210] hover:underline"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          <div className="mt-12 flex flex-col gap-4 rounded-2xl bg-[#f7faf5] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h2 className="text-lg font-bold">Bạn muốn khám phá thêm?</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Xem danh mục sản phẩm hoặc tìm hiểu thêm về DemoStore.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-md bg-[#55b000] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#4d9210]"
              >
                Đến cửa hàng
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-[#55b000] hover:text-[#4d9210]"
              >
                Về DemoStore
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
