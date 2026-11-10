import { expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductDetailPage from '@/pages/storefront/products/detail';

vi.mock('@/features/storefront/hooks/use-store-products', () => ({
  useStoreProduct: () => ({
    data: {
      _id: 'a'.repeat(24),
      slug: 'headphones',
      product_name: 'Headphones',
      thumbnail: '/generic.png',
      brand: null,
      category: null,
      stock: 8,
      images: [{ secure_url: '/shared.png', public_id: 'shared' }],
      variants: [
        {
          _id: 'b'.repeat(24),
          sku: 'BLACK',
          variant_name: 'Đen',
          price: 100,
          stock: 2,
          image: '/black.png',
          images: ['/shared.png'],
        },
        {
          _id: 'c'.repeat(24),
          sku: 'WHITE',
          variant_name: 'Trắng',
          price: 200,
          stock: 6,
          image: '/white.png',
          images: ['/shared.png'],
        },
      ],
    },
  }),
}));
vi.mock('@/features/storefront/components/store-product-feedback', () => ({
  StoreRatingSummary: () => null,
  StoreProductReviews: () => null,
}));
vi.mock('@/features/storefront/components/related-products', () => ({
  RelatedProducts: () => null,
}));
vi.mock('@/features/storefront/components/product-news-sidebar', () => ({
  ProductNewsSidebar: () => null,
}));

it('selects the matching variant from thumbnails and arrows while shared/generic images preserve the current variant', () => {
  render(
    <MemoryRouter initialEntries={['/shop/headphones']}>
      <Routes>
        <Route path="/shop/:slug" element={<ProductDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
  const black = screen.getByRole('button', { name: 'Đen' });
  const white = screen.getByRole('button', { name: 'Trắng' });
  fireEvent.click(screen.getByRole('button', { name: 'Xem ảnh 4' }));
  expect(white.getAttribute('aria-pressed')).toBe('true');
  expect(screen.getByText('Còn 6 sản phẩm')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Xem ảnh 2' }));
  expect(white.getAttribute('aria-pressed')).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: 'Ảnh tiếp theo' }));
  expect(black.getAttribute('aria-pressed')).toBe('true');
  expect(screen.getByText('Còn 2 sản phẩm')).toBeTruthy();
  fireEvent.click(white);
  expect(
    screen
      .getByRole('button', { name: 'Xem ảnh 4' })
      .getAttribute('aria-pressed')
  ).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: 'Xem ảnh 1' }));
  expect(white.getAttribute('aria-pressed')).toBe('true');
});
