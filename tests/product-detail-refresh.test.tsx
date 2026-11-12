import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductDetailPage from '@/pages/admin/products/detail';
import { useAuthStore } from '@/stores/auth.store';

const state = vi.hoisted(() => ({ fetching: false }));
vi.mock('@/features/products/hooks/use-product', () => ({
  useProduct: () => ({
    data: {
      _id: 'a'.repeat(24),
      __v: 1,
      product_name: 'Test product',
      category: null,
      brand: null,
      stock: 50,
    },
    isFetching: state.fetching,
    isError: false,
  }),
}));
vi.mock('@/layout/admin/base-layout', () => ({
  BaseLayout: ({ children }: { children: ReactNode }) => (
    <main>{children}</main>
  ),
}));
vi.mock('@/features/products/components/product-reviews', () => ({
  ProductReviews: () => <section aria-label="reviews" />,
}));
vi.mock('@/features/products/components/product-gallery', () => ({
  ProductGallery: () => <section aria-label="gallery" />,
}));
vi.mock('@/features/products/components/product-news-editor', () => ({
  ProductNewsEditor: () => <section aria-label="news" />,
}));
afterEach(() => {
  state.fetching = false;
  useAuthStore.getState().clearSession();
});

it('keeps details read-only through background updates and links to separate inventory management', () => {
  useAuthStore.getState().setSession(
    {
      id: 'a'.repeat(24),
      name: 'Admin',
      firstName: 'Admin',
      lastName: '',
      email: 'admin@example.com',
      role: 'admin',
      mustChangePassword: false,
    },
    { accessToken: 'test' }
  );
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const page = () => (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/auth/products/' + 'a'.repeat(24)]}>
        <Routes>
          <Route path="/auth/products/:id" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
  const view = render(page());
  expect(
    screen.getByRole('link', { name: 'Cập nhật tồn kho' }).getAttribute('href')
  ).toBe('/auth/products/' + 'a'.repeat(24) + '/inventory');
  for (let i = 0; i < 5; i++) {
    for (const fetching of [true, false]) {
      state.fetching = fetching;
      view.rerender(page());
      expect(
        screen.queryByRole('region', { name: 'Cập nhật tồn kho' })
      ).toBeNull();
      expect(
        screen.getAllByRole('heading', {
          name: 'Thông tin bán hàng và vận chuyển',
        })
      ).toHaveLength(1);
      expect(screen.getAllByRole('region', { name: 'news' })).toHaveLength(1);
      expect(screen.queryByRole('region', { name: 'gallery' })).toBeNull();
      expect(screen.queryByRole('spinbutton')).toBeNull();
    }
  }
  view.unmount();
  client.clear();
});
