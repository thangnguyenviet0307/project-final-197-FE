import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { LoadingImage } from '@/components/loading-image';
import { createPortal } from 'react-dom';
import { StorefrontUiContext } from '@/context/storefront-ui-context';
import { RootFallback } from '@/layout/root-layout';
import { StorefrontNewsSection } from '@/features/storefront/components/storefront-news-section';
import { usePublicArticles } from '@/features/storefront/hooks/use-public-articles';
import { ProductSection } from '@/features/storefront/components/product-section';
import { useStoreProductCarousel } from '@/features/storefront/hooks/use-store-product-carousel';

vi.mock('@/features/storefront/hooks/use-public-articles', () => ({
  usePublicArticles: vi.fn(),
}));
vi.mock('@/features/storefront/hooks/use-store-product-carousel', () => ({
  useStoreProductCarousel: vi.fn(),
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it('separates admin and store skeleton contexts, including portal content and image placeholders', () => {
  const { container, rerender } = render(
    <LoadingSkeleton variant="table" label="Admin table" />
  );
  expect(screen.getByRole('status').getAttribute('data-loading-area')).toBe(
    'admin'
  );
  expect(
    container.querySelector('[data-loading-area="storefront"]')
  ).toBeNull();
  rerender(
    <StorefrontUiContext.Provider value={true}>
      {createPortal(
        <>
          <LoadingSkeleton variant="products" label="Store products" />
          <LoadingImage src="https://example.com/p.png" alt="Store image" />
        </>,
        document.body
      )}
    </StorefrontUiContext.Provider>
  );
  expect(screen.getByRole('status').getAttribute('data-loading-area')).toBe(
    'storefront'
  );
  expect(
    screen.getByAltText('Store image').getAttribute('data-loading-area')
  ).toBe('storefront');
  expect(document.querySelector('[data-loading-area="admin"]')).toBeNull();
});

it('uses a store shell before StoreLayout mounts and an admin shell only for admin routes', () => {
  const { container, rerender } = render(<RootFallback storefront />);
  expect(container.querySelector('[data-loading-area="admin"]')).toBeNull();
  expect(container.querySelector('aside')).toBeNull();
  rerender(<RootFallback storefront={false} />);
  expect(
    container.querySelector('[data-loading-area="storefront"]')
  ).toBeNull();
  expect(container.querySelector('aside')).not.toBeNull();
});

it('carousel only animates missing cards while loading, not on empty or error results', () => {
  const query = {
    isPending: true,
    isFetching: true,
    isFetchingNextPage: false,
    isError: false,
    data: undefined,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    refetch: vi.fn(),
  };
  vi.mocked(useStoreProductCarousel).mockReturnValue(
    query as unknown as ReturnType<typeof useStoreProductCarousel>
  );
  const { container, rerender } = render(
    <MemoryRouter>
      <ProductSection title="Products" filters={{}} />
    </MemoryRouter>
  );
  expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull();
  query.isPending = false;
  query.isFetching = false;
  rerender(
    <MemoryRouter>
      <ProductSection title="Products" filters={{}} />
    </MemoryRouter>
  );
  expect(container.querySelector('[data-slot="skeleton"]')).toBeNull();
  expect(screen.getByText('Chưa có sản phẩm.')).toBeTruthy();
  query.isError = true;
  rerender(
    <MemoryRouter>
      <ProductSection title="Products" filters={{}} />
    </MemoryRouter>
  );
  expect(container.querySelector('[data-slot="skeleton"]')).toBeNull();
  expect(screen.getByRole('alert')).toBeTruthy();
});

it.each([
  'form',
  'table',
  'products',
  'product',
  'preview',
  'articles',
  'article',
  'text',
  'options',
  'chips',
  'categories',
  'chat',
  'stats',
  'inline',
] as const)(
  'exposes one accessible loading status for %s without interactive placeholders',
  (variant) => {
    const { container } = render(
      <LoadingSkeleton variant={variant} label="Loading fixture" />
    );
    expect(screen.getByRole('status').getAttribute('aria-busy')).toBe('true');
    expect(screen.getByText('Loading fixture').className).toContain('sr-only');
    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length
    ).toBeGreaterThan(0);
    expect(container.querySelector('button, input, a')).toBeNull();
    if (variant === 'inline') expect(container.querySelector('div')).toBeNull();
  }
);

it('image loading ends on load or error, preserves callbacks and restarts for a new source', () => {
  const onLoad = vi.fn(),
    onError = vi.fn();
  const { rerender } = render(
    <LoadingImage
      src="https://example.com/a.jpg"
      alt="Photo"
      onLoad={onLoad}
      onError={onError}
      className="h-20 w-24"
    />
  );
  const image = screen.getByAltText('Photo');
  expect(image.getAttribute('data-slot')).toBe('skeleton');
  fireEvent.load(image);
  expect(onLoad).toHaveBeenCalledOnce();
  expect(image.getAttribute('data-slot')).toBeNull();
  rerender(
    <LoadingImage
      src="https://example.com/b.jpg"
      alt="Photo"
      onLoad={onLoad}
      onError={onError}
      className="h-20 w-24"
    />
  );
  expect(image.getAttribute('aria-busy')).toBe('true');
  fireEvent.error(image);
  expect(onError).toHaveBeenCalledOnce();
  expect(image.getAttribute('aria-busy')).toBe('false');
  expect(image.className).toContain('h-20 w-24');
});

it('news skeleton clears on empty/error and never hides cached articles during refetch', () => {
  const mock = vi.mocked(usePublicArticles);
  const query = {
    isPending: true,
    isError: false,
    isFetching: true,
    data: { data: [] },
    refetch: vi.fn(),
  };
  mock.mockReturnValue(
    query as unknown as ReturnType<typeof usePublicArticles>
  );
  const { container, rerender } = render(
    <MemoryRouter>
      <StorefrontNewsSection />
    </MemoryRouter>
  );
  expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull();
  query.isPending = false;
  query.isFetching = false;
  rerender(
    <MemoryRouter>
      <StorefrontNewsSection />
    </MemoryRouter>
  );
  expect(container.querySelector('[data-slot="skeleton"]')).toBeNull();
  expect(screen.getByText('Chưa có tin tức được xuất bản.')).toBeTruthy();
  query.isError = true;
  rerender(
    <MemoryRouter>
      <StorefrontNewsSection />
    </MemoryRouter>
  );
  expect(screen.getByRole('alert')).toBeTruthy();
  expect(container.querySelector('[data-slot="skeleton"]')).toBeNull();
  mock.mockReturnValue({
    ...query,
    isError: false,
    isFetching: true,
    data: {
      data: [
        {
          _id: 'news-1',
          title: 'Cached article',
          slug: 'cached-article',
          excerpt: 'Cached content',
          imageUrl: null,
          publishedAt: '2026-11-12T00:00:00Z',
          createdAt: '2026-11-12T00:00:00Z',
          authorName: 'Store',
        },
      ],
    },
  } as unknown as ReturnType<typeof usePublicArticles>);
  rerender(
    <MemoryRouter>
      <StorefrontNewsSection />
    </MemoryRouter>
  );
  expect(screen.getByText('Cached article')).toBeTruthy();
  expect(container.querySelector('[data-slot="skeleton"]')).toBeNull();
});
