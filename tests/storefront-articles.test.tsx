import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import { StorefrontNewsSection } from '@/features/storefront/components/storefront-news-section';
import StorefrontArticleDetailPage from '@/pages/storefront/articles/detail';
vi.mock('@/features/storefront/services/articles.service', () => ({
  recordArticleView: vi.fn(async () => {}),
}));

const state = vi.hoisted(() => ({
  articles: [
    {
      _id: 'article-1',
      type: 'news' as const,
      title: 'Chọn cáp sạc phù hợp: bắt đầu từ cổng kết nối',
      slug: 'chon-cap-sac',
      category: 'Cẩm nang chọn mua',
      excerpt: 'Kiểm tra thiết bị trước khi chọn cáp.',
      content: 'Nội dung bài viết',
      imageUrl: null,
      tags: ['cáp sạc'],
      authorName: 'Ban biên tập',
      publishedAt: '2026-10-28T10:00:00.000Z',
      isFeatured: false,
      viewCount: 0,
      seo: {},
    },
  ],
  articlesPending: false,
  articlesError: false,
  articlesRefetch: vi.fn(),
  article: {
    _id: 'article-1',
    type: 'blog' as const,
    title: 'Bài viết mẫu',
    slug: 'bai-viet-mau',
    category: 'Kinh nghiệm',
    excerpt: 'Tóm tắt bài viết.',
    content: 'Dòng nội dung an toàn.\n<script>alert(1)</script>',
    imageUrl: null,
    tags: ['blog'],
    authorName: 'Ban biên tập',
    publishedAt: '2026-10-28T10:00:00.000Z',
    isFeatured: false,
    viewCount: 0,
    seo: {},
  },
}));
vi.mock('@/features/storefront/hooks/use-public-articles', () => ({
  usePublicArticles: (type: 'news' | 'blog') => ({
    data: {
      data:
        type === 'blog'
          ? [{ ...state.article, type }]
          : state.articles.map((article) => ({ ...article, type })),
      pagination: {
        page: 1,
        limit: 3,
        total: type === 'blog' ? 1 : state.articles.length,
        totalPages: 1,
      },
    },
    isPending: state.articlesPending,
    isError: state.articlesError,
    error: new Error('Backend unavailable'),
    refetch: state.articlesRefetch,
  }),
  usePublicArticle: () => ({
    data: state.article,
    isPending: state.articlesPending,
    isError: state.articlesError,
    error: new Error('Backend unavailable'),
    refetch: state.articlesRefetch,
  }),
}));
it('renders Backend news cards and links to the article detail page', () => {
  render(
    <MemoryRouter>
      <StorefrontNewsSection />
    </MemoryRouter>
  );
  expect(
    screen.getByRole('region', { name: 'Tin tức và cẩm nang phụ kiện' })
  ).toBeTruthy();
  expect(
    screen.getByRole('heading', { name: 'Tin tức & Cẩm nang' })
  ).toBeTruthy();
  expect(
    screen.getByRole('heading', {
      name: 'Chọn cáp sạc phù hợp: bắt đầu từ cổng kết nối',
    })
  ).toBeTruthy();
  expect(
    screen.getByRole('link', { name: 'Đọc bài viết' }).getAttribute('href')
  ).toBe('/bai-viet/chon-cap-sac');
});
it('shows news loading, empty and request error states with retry', () => {
  state.articlesPending = true;
  const view = render(
    <MemoryRouter>
      <StorefrontNewsSection />
    </MemoryRouter>
  );
  expect(screen.getByRole('status').textContent).toContain('Đang tải tin tức');
  state.articlesPending = false;
  state.articlesError = true;
  view.rerender(
    <MemoryRouter>
      <StorefrontNewsSection />
    </MemoryRouter>
  );
  expect(screen.getByRole('alert').textContent).toContain(
    'Backend unavailable'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Thử tải lại' }));
  expect(state.articlesRefetch).toHaveBeenCalled();
  state.articlesError = false;
  state.articles = [];
  view.rerender(
    <MemoryRouter>
      <StorefrontNewsSection />
    </MemoryRouter>
  );
  expect(screen.getByText('Chưa có tin tức được xuất bản.')).toBeTruthy();
  state.articles = [
    {
      _id: 'article-1',
      type: 'news',
      title: 'Chọn cáp sạc phù hợp: bắt đầu từ cổng kết nối',
      slug: 'chon-cap-sac',
      category: 'Cẩm nang chọn mua',
      excerpt: 'Kiểm tra thiết bị trước khi chọn cáp.',
      content: 'Nội dung bài viết',
      imageUrl: null,
      tags: ['cáp sạc'],
      authorName: 'Ban biên tập',
      publishedAt: '2026-10-28T10:00:00.000Z',
      isFeatured: false,
      viewCount: 0,
      seo: {},
    },
  ];
});
it('renders safe article detail content', () => {
  const detail = render(
    <MemoryRouter initialEntries={['/bai-viet/bai-viet-mau']}>
      <Routes>
        <Route
          path="/bai-viet/:slug"
          element={<StorefrontArticleDetailPage />}
        />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByRole('heading', { name: 'Bài viết mẫu' })).toBeTruthy();
  expect(detail.container.querySelector('script')).toBeNull();
  expect(screen.getByText(/<script>alert\(1\)<\/script>/)).toBeTruthy();
});

it('keeps repeated article tags consistent through data refreshes without duplicate keys', () => {
  const previousTags = state.article.tags;
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    const page = () => (
      <MemoryRouter initialEntries={['/bai-viet/bai-viet-mau']}>
        <Routes>
          <Route
            path="/bai-viet/:slug"
            element={<StorefrontArticleDetailPage />}
          />
        </Routes>
      </MemoryRouter>
    );
    state.article.tags = ['blog', 'blog'];
    const view = render(page());
    for (const tags of [
      ['blog', 'blog'],
      ['blog'],
      ['news', 'blog', 'blog'],
      [],
    ]) {
      state.article.tags = tags;
      view.rerender(page());
      const list = screen.queryByRole('list', { name: 'Thẻ bài viết' });
      expect(
        list
          ? [...list.querySelectorAll('li')].map((item) => item.textContent)
          : []
      ).toEqual(tags);
    }
    expect(
      errors.mock.calls.filter((call) =>
        call.some((value) => String(value).includes('same key'))
      )
    ).toHaveLength(0);
  } finally {
    state.article.tags = previousTags;
    errors.mockRestore();
  }
});
