import { afterEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosHeaders } from 'axios';
import { api } from '@/services/api';
import { ProductForm } from '@/features/products/components/product-form';

vi.mock('@/features/products/components/product-description-editor', () => ({
  ProductDescriptionEditor: () => null,
}));
const adapter = api.defaults.adapter;
const originalScroll = HTMLElement.prototype.scrollIntoView;
const root = 'a'.repeat(24),
  child = 'b'.repeat(24),
  brand = 'c'.repeat(24);
let client: QueryClient;
afterEach(() => {
  api.defaults.adapter = adapter;
  client?.clear();
  vi.unstubAllGlobals();
  if (originalScroll) HTMLElement.prototype.scrollIntoView = originalScroll;
  else Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
});
function setup() {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  HTMLElement.prototype.scrollIntoView = vi.fn();
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  api.defaults.adapter = async (config) => ({
    config,
    headers: new AxiosHeaders(),
    status: 200,
    statusText: 'OK',
    data: {
      data:
        config.url === '/categories'
          ? [
              { _id: root, name: 'Máy tính', isActive: true },
              {
                _id: child,
                name: 'Máy tính xách tay',
                parent: root,
                isActive: true,
              },
            ]
          : config.url === '/brands'
            ? [{ _id: brand, name: 'SONY', isActive: true }]
            : {
                publishedAt: '2026-11-10T00:00:00Z',
                content: {
                  warranty: 'Bảo hành đã công bố',
                  shipping: 'Giao hàng',
                  returns: 'Đổi trả',
                  support: '',
                  privacy: '',
                  payment: '',
                },
              },
    },
  });
  render(
    <QueryClientProvider client={client}>
      <RouterProvider
        router={createMemoryRouter([
          {
            path: '/',
            element: <ProductForm pending={false} save={vi.fn()} />,
          },
        ])}
      />
    </QueryClientProvider>
  );
}

it('searches root category/brand options and independently searches additional child categories', async () => {
  setup();
  const category = await screen.findByRole('combobox', { name: 'Danh mục' });
  fireEvent.click(category);
  fireEvent.change(screen.getByRole('combobox', { name: 'Tìm danh mục' }), {
    target: { value: 'may tinh' },
  });
  expect(screen.getByRole('option', { name: 'Máy tính' })).toBeTruthy();
  expect(
    screen.queryByRole('option', { name: 'Máy tính xách tay' })
  ).toBeNull();
  fireEvent.click(screen.getByRole('option', { name: 'Máy tính' }));
  fireEvent.click(screen.getByRole('combobox', { name: 'Thương hiệu' }));
  fireEvent.change(screen.getByRole('combobox', { name: 'Tìm thương hiệu' }), {
    target: { value: 'sony' },
  });
  fireEvent.click(screen.getByRole('option', { name: 'SONY' }));
  fireEvent.change(screen.getByLabelText('Tìm danh mục bổ sung'), {
    target: { value: 'xach tay' },
  });
  fireEvent.click(screen.getByRole('checkbox', { name: 'Máy tính xách tay' }));
  fireEvent.change(screen.getByLabelText('Tìm danh mục bổ sung'), {
    target: { value: '' },
  });
  expect(
    (
      screen.getByRole('checkbox', {
        name: 'Máy tính xách tay',
      }) as HTMLInputElement
    ).checked
  ).toBe(true);
});

it('marks required fields without marking optional product fields and keeps notes when selecting a policy', async () => {
  setup();
  const name = await screen.findByLabelText('Tên sản phẩm');
  expect(name.getAttribute('aria-required')).toBe('true');
  expect(
    screen.getByLabelText('SKU sản phẩm').getAttribute('aria-required')
  ).toBe('false');
  expect(
    screen.getByLabelText('Năm sản xuất').getAttribute('aria-required')
  ).toBe('false');
  const note = screen.getByLabelText(
    'Thông tin bảo hành'
  ) as HTMLTextAreaElement;
  fireEvent.change(note, { target: { value: 'Ghi chú riêng' } });
  const select = screen.getByLabelText('Chọn chính sách bảo hành của cửa hàng');
  await waitFor(() =>
    expect((select as HTMLSelectElement).disabled).toBe(false)
  );
  fireEvent.change(select, { target: { value: '/chinh-sach-bao-hanh' } });
  expect(note.value).toBe('Ghi chú riêng\n/chinh-sach-bao-hanh');
  fireEvent.change(select, { target: { value: '' } });
  expect(note.value).toBe('Ghi chú riêng');
});
