import BrandCreatePage from '@/pages/admin/brands/create';
import CategoryCreatePage from '@/pages/admin/categories/create';
import type { ReactNode } from 'react';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter, useLocation, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import CustomersPage from '@/pages/admin/customers/index';
import BrandsPage from '@/pages/admin/brands/index';
import CategoriesPage from '@/pages/admin/categories/index';
import { customersService } from '@/features/customers/services/customers.service';
import { getTemporaryPassword } from '@/features/users/services/users.service';
import { api, clearAuth } from '@/services/api';
import { queryClient } from '@/services/query-client';
import { useAuthStore } from '@/stores/auth.store';

vi.mock('@/layout/admin/base-layout', () => ({
  BaseLayout: ({ children }: { children: ReactNode }) => (
    <main>{children}</main>
  ),
}));
const originalAdapter = api.defaults.adapter;
const customer = {
  _id: 'a'.repeat(24),
  firstName: 'An',
  lastName: 'Nguyen',
  email: 'an@example.com',
  phone: '0901234567',
  address: { street: 'One', city: 'Tỉnh/thành phố', state: 'Bang/khu vực' },
  isActive: true,
};
const brand = {
  _id: 'b'.repeat(24),
  name: 'Acme',
  slug: 'acme',
  description: 'Devices',
  isActive: true,
};
const category = {
  _id: 'c'.repeat(24),
  name: 'Phones',
  slug: 'phones',
  description: 'Devices',
  isActive: true,
  parent: null,
};

beforeEach(() => {
  clearAuth();
  useAuthStore.getState().setSession(
    {
      id: 'self',
      name: 'Quản trị viên',
      firstName: 'Quản trị viên',
      lastName: '',
      email: 'self@example.com',
      role: 'admin',
      mustChangePassword: false,
    },
    { accessToken: 'a', refreshToken: 'r' }
  );
});
afterEach(() => {
  api.defaults.adapter = originalAdapter;
  clearAuth();
});
function LocationDebug() {
  return <output data-testid="location">{useLocation().search}</output>;
}
function setup(page: ReactNode, path = '/') {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/auth/brands/new" element={<BrandCreatePage />} />
          <Route path="/auth/categories/new" element={<CategoryCreatePage />} />
          <Route path="*" element={page} />
        </Routes>
        <LocationDebug />
      </MemoryRouter>
    </QueryClientProvider>
  );
}
function mockApi(
  resource: 'customers' | 'brands' | 'categories',
  rejectDelete = false
) {
  const writes = vi.fn();
  const gets = vi.fn();
  api.defaults.adapter = async (config) => {
    if (config.url === '/products')
      return {
        config,
        headers: new AxiosHeaders(),
        status: 200,
        statusText: 'OK',
        data: { data: [], pagination: { total: 0, totalPages: 0 } },
      };
    const record =
      resource === 'customers'
        ? customer
        : resource === 'brands'
          ? brand
          : category;
    const response = {
      config,
      headers: new AxiosHeaders(),
      status: 200,
      statusText: 'OK',
      data: {
        success: true,
        data: config.method === 'get' ? [record] : record,
        pagination: {
          page: Number(config.params?.page ?? 1),
          limit: 10,
          total: 101,
          totalPages: 11,
        },
      },
    };
    if (config.method === 'get') gets(config.params);
    else
      writes(
        config.method,
        config.url,
        config.data ? JSON.parse(config.data) : undefined
      );
    if (rejectDelete && config.method === 'delete')
      throw new AxiosError('Conflict', 'ERR_BAD_REQUEST', config, undefined, {
        ...response,
        status: 409,
        data: { message: 'Referenced by products' },
      });
    return response;
  };
  return { writes, gets };
}

it.each(['super_admin', 'admin', 'staff'] as const)(
  '%s opens category, brand and customer details from rows',
  async (role) => {
    useAuthStore.setState((state) => ({ user: { ...state.user!, role } }));
    const writes = vi.fn();
    api.defaults.adapter = async (config) => {
      if (config.method !== 'get') writes(config.method);
      const data =
        config.url === '/brands'
          ? [brand]
          : config.url === '/categories'
            ? [category]
            : [customer];
      return {
        config,
        headers: new AxiosHeaders(),
        status: 200,
        statusText: 'OK',
        data: {
          data,
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        },
      };
    };
    setup(
      <>
        <CategoriesPage />
        <BrandsPage />
        <CustomersPage />
      </>
    );
    const categoryRow = await screen.findByRole('row', {
      name: 'Xem danh mục Phones',
    });
    fireEvent.click(categoryRow);
    const categoryDialog = await screen.findByRole('dialog', {
      name: 'Chi tiết danh mục',
    });
    expect(within(categoryDialog).getByText('Danh mục gốc')).toBeTruthy();
    fireEvent.keyDown(categoryDialog, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    fireEvent.keyDown(
      await screen.findByRole('row', { name: 'Xem thương hiệu Acme' }),
      { key: 'Enter' }
    );
    const brandDialog = await screen.findByRole('dialog', {
      name: 'Chi tiết thương hiệu',
    });
    expect(within(brandDialog).getByText('Devices')).toBeTruthy();
    fireEvent.keyDown(brandDialog, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    fireEvent.click((await screen.findByText('an@example.com')).closest('tr')!);
    const customerDialog = await screen.findByRole('dialog', {
      name: 'Hồ sơ khách hàng',
    });
    expect(
      within(customerDialog).getAllByText('an@example.com').length
    ).toBeGreaterThan(0);
    expect(writes).not.toHaveBeenCalled();
    if (role === 'staff') {
      expect(screen.queryByRole('button', { name: 'Edit Phones' })).toBeNull();
      expect(
        screen.queryByRole('button', { name: 'Delete Phones' })
      ).toBeNull();
      expect(screen.queryByRole('button', { name: 'Xóa Acme' })).toBeNull();
      expect(screen.queryByRole('button', { name: /Xóa.*An/ })).toBeNull();
    }
  }
);

it('filters root and child categories and resolves both parent shapes', async () => {
  const child = {
    ...category,
    _id: 'd'.repeat(24),
    name: 'Child',
    slug: 'child',
    parent: category._id,
  };
  const populated = {
    ...child,
    _id: 'e'.repeat(24),
    name: 'Populated',
    parent: { _id: category._id, name: category.name },
  };
  const third = { ...child, _id: 'f'.repeat(24), name: 'Third child' };
  api.defaults.adapter = async (config) => ({
    config,
    headers: new AxiosHeaders(),
    status: 200,
    statusText: 'OK',
    data: { data: [category, child, populated, third] },
  });
  setup(<CategoriesPage />);
  const childRow = await screen.findByRole('row', {
    name: 'Xem danh mục Child',
  });
  expect(
    screen.getByRole('columnheader', { name: 'Danh mục cha' })
  ).toBeTruthy();
  expect(
    screen.getByRole('columnheader', { name: 'Danh mục con' })
  ).toBeTruthy();
  const rootRow = screen.getByRole('row', { name: 'Xem danh mục Phones' });
  const children = within(rootRow).getByRole('list', {
    name: 'Danh mục con của Phones',
  });
  expect(within(children).getByText('Child')).toBeTruthy();
  expect(within(children).getByText('Populated')).toBeTruthy();
  expect(within(children).queryByText('Third child')).toBeNull();
  expect(within(rootRow).getByText('3 danh mục con')).toBeTruthy();
  expect(within(rootRow).getByText('+1 danh mục khác')).toBeTruthy();
  expect(screen.getAllByRole('columnheader')).toHaveLength(5);
  fireEvent.click(rootRow);
  const detail = await screen.findByRole('dialog', {
    name: 'Chi tiết danh mục',
  });
  expect(within(detail).getByText(/Third child/)).toBeTruthy();
  expect(within(detail).getByText('phones')).toBeTruthy();
  fireEvent.keyDown(detail, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(within(childRow).getByText('Không có')).toBeTruthy();
  expect(within(childRow).getByText('Phones')).toBeTruthy();
  expect(
    within(
      screen.getByRole('row', { name: 'Xem danh mục Populated' })
    ).getByText('Phones')
  ).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Loại danh mục'), {
    target: { value: 'root' },
  });
  expect(screen.queryByRole('row', { name: 'Xem danh mục Child' })).toBeNull();
  expect(screen.getByRole('row', { name: 'Xem danh mục Phones' })).toBeTruthy();
  expect(
    within(screen.getByRole('row', { name: 'Xem danh mục Phones' })).getByText(
      'Child'
    )
  ).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Loại danh mục'), {
    target: { value: 'child' },
  });
  expect(screen.queryByRole('row', { name: 'Xem danh mục Phones' })).toBeNull();
  expect(screen.getByRole('row', { name: 'Xem danh mục Child' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Đặt lại bộ lọc' }));
  expect(screen.getByRole('row', { name: 'Xem danh mục Phones' })).toBeTruthy();
});

it('opens category edit without also opening the row detail', async () => {
  mockApi('categories');
  setup(<CategoriesPage />);
  fireEvent.click(await screen.findByRole('button', { name: 'Edit Phones' }));
  expect(
    await screen.findByRole('dialog', { name: 'Chỉnh sửa danh mục' })
  ).toBeTruthy();
  expect(
    screen.queryByRole('dialog', { name: 'Chi tiết danh mục' })
  ).toBeNull();
});

it('exposes no administrative customer creation method', () => {
  expect(Object.hasOwn(customersService, 'createCustomer')).toBe(false);
});

it('displays a guest CRM contact and links its administrative order history', async () => {
  api.defaults.adapter = async (config) => ({
    config,
    headers: new AxiosHeaders(),
    status: 200,
    statusText: 'OK',
    data: {
      data: [
        {
          ...customer,
          firstName: '',
          lastName: '',
          displayName: 'Guest Buyer',
          customerType: 'guest',
          contactSource: 'guest',
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    },
  });
  setup(<CustomersPage />, '/auth/customers');
  expect(await screen.findByText('Guest Buyer')).toBeTruthy();
  expect(screen.getByText(/Khách vãng lai/)).toBeTruthy();
  const link = screen
    .getAllByRole('link')
    .find((item) => item.getAttribute('href')?.includes(customer._id));
  expect(link?.getAttribute('href')).toContain(`customerId=${customer._id}`);
  fireEvent.click(screen.getByRole('button', { name: 'Xem Guest Buyer' }));
  expect(await screen.findByText(/chưa xác minh danh tính/)).toBeTruthy();
});

it('shows newly registered contacts in the single contact list without an account section', async () => {
  const requests: string[] = [];
  api.defaults.adapter = async (config) => {
    requests.push(config.url ?? '');
    expect(config.url).toBe('/customers');
    return {
      config,
      headers: new AxiosHeaders(),
      status: 200,
      statusText: 'OK',
      data: {
        data: [
          {
            ...customer,
            email: 'registered@example.com',
            phone: '',
            address: { street: '', city: '', state: '' },
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    };
  };
  setup(<CustomersPage />, '/auth/customers');
  expect(await screen.findByText('registered@example.com')).toBeTruthy();
  expect(screen.queryByText('Tài khoản đăng ký')).toBeNull();
  expect(screen.getAllByText('Chưa cung cấp')).toHaveLength(7);
  expect(requests).not.toContain('/customers/accounts');
});

it('loads later customer pages on the server, retains totals and resets page on search', async () => {
  const { gets } = mockApi('customers');
  setup(<CustomersPage />, '/auth/customers?page=10');
  await screen.findByText('an@example.com');
  expect(gets).toHaveBeenCalledWith({ page: 10, limit: 10 });
  expect(screen.getByText('Tổng cộng: 101 khách hàng')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Tiếp' }));
  await waitFor(() =>
    expect(gets).toHaveBeenCalledWith({ page: 11, limit: 10 })
  );
  await screen.findByText('an@example.com');
  fireEvent.change(screen.getByLabelText('Tìm khách hàng'), {
    target: { value: 'An' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Tìm kiếm' }));
  await waitFor(() =>
    expect(gets).toHaveBeenCalledWith({ page: 1, limit: 10, search: 'An' })
  );
  expect(screen.getByTestId('location').textContent).toContain('page=1');
});

it('maps current customer profile and shipping data into the administrative table and details', async () => {
  api.defaults.adapter = async (config) => {
    expect(config.url).toBe('/customers');
    return {
      config,
      headers: new AxiosHeaders(),
      status: 200,
      statusText: 'OK',
      data: {
        success: true,
        data: [
          {
            ...customer,
            birthDate: '2000-02-29',
            gender: 'female',
            shippingAddress: {
              recipientName: 'Người nhận mới',
              email: 'shipping@example.com',
              province: 'Đà Nẵng',
              ward: 'Thanh Khê',
              street: 'K19A/25 Hà Huy Tập',
              deliveryTime: 'Sáng mỗi ngày',
            },
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    };
  };
  setup(<CustomersPage />, '/auth/customers');
  const table = await screen.findByRole('table', { name: 'Hồ sơ khách hàng' });
  for (const value of [
    '29/02/2000',
    'Nữ',
    '0901234567',
    'Người nhận mới',
    'shipping@example.com',
    'K19A/25 Hà Huy Tập, Thanh Khê, Đà Nẵng',
    'Sáng mỗi ngày',
  ])
    expect(within(table).getByText(value)).toBeTruthy();
  expect(
    within(table).queryByText('One, Tỉnh/thành phố, Bang/khu vực')
  ).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Xem Nguyen An' }));
  const dialog = await screen.findByRole('dialog', {
    name: 'Hồ sơ khách hàng',
  });
  expect(within(dialog).getByText('Nữ')).toBeTruthy();
  expect(within(dialog).getByText('shipping@example.com')).toBeTruthy();
  expect(
    within(dialog).getByText('K19A/25 Hà Huy Tập, Thanh Khê, Đà Nẵng')
  ).toBeTruthy();
});

it('refreshes the administrative row after a storefront business-change signal', async () => {
  let changed = false;
  api.defaults.adapter = async (config) => ({
    config,
    headers: new AxiosHeaders(),
    status: 200,
    statusText: 'OK',
    data: {
      success: true,
      data: [
        {
          ...customer,
          phone: changed ? '0911111111' : customer.phone,
          gender: changed ? 'male' : '',
          shippingAddress: changed
            ? {
                recipientName: 'Người nhận',
                email: 'shipping@example.com',
                province: 'Đà Nẵng',
                ward: 'Thanh Khê',
                street: 'Địa chỉ mới',
                deliveryTime: 'Buổi sáng',
              }
            : undefined,
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    },
  });
  setup(<CustomersPage />, '/auth/customers');
  await screen.findByText(customer.phone);
  changed = true;
  window.dispatchEvent(
    new StorageEvent('storage', {
      key: 'admin-data-updated',
      newValue: JSON.stringify({
        type: 'business-data-changed',
        id: 'profile-saved',
      }),
    })
  );
  expect(await screen.findByText('0911111111')).toBeTruthy();
  expect(screen.getByText('Nam')).toBeTruthy();
  expect(screen.getByText('Địa chỉ mới, Thanh Khê, Đà Nẵng')).toBeTruthy();
});

it('shows global customer status counts and applies status filters on the server', async () => {
  const requests = vi.fn();
  api.defaults.adapter = async (config) => {
    requests(config.params);
    const total =
      config.params?.isActive === true
        ? 80
        : config.params?.isActive === false
          ? 21
          : 101;
    return {
      config,
      headers: new AxiosHeaders(),
      status: 200,
      statusText: 'OK',
      data: {
        success: true,
        data: [{ ...customer, isActive: config.params?.isActive !== false }],
        pagination: {
          page: config.params?.page ?? 1,
          limit: config.params?.limit ?? 10,
          total,
          totalPages: Math.ceil(total / (config.params?.limit ?? 10)),
        },
      },
    };
  };
  setup(<CustomersPage />, '/auth/customers?page=3&search=An');
  await screen.findByText('an@example.com');
  const statistics = screen.getByRole('region', {
    name: 'Thống kê khách hàng',
  });
  await waitFor(() => expect(within(statistics).getByText('101')).toBeTruthy());
  expect(within(statistics).getByText('80')).toBeTruthy();
  expect(within(statistics).getByText('21')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Trạng thái'), {
    target: { value: 'inactive' },
  });
  await waitFor(() =>
    expect(requests).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      search: 'An',
      isActive: false,
    })
  );
  await screen.findByText('an@example.com');
  expect(
    within(screen.getByRole('table', { name: 'Hồ sơ khách hàng' })).getByText(
      'Ngừng hoạt động'
    )
  ).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Đặt lại' }));
  await waitFor(() =>
    expect(requests).toHaveBeenCalledWith({ page: 1, limit: 10 })
  );
  expect(screen.getByTestId('location').textContent).not.toContain('status=');
  expect(screen.getByTestId('location').textContent).not.toContain('search=');
});

it('has no create action and permits existing customer deletion only after confirmation', async () => {
  const { writes } = mockApi('customers');
  setup(<CustomersPage />);
  await screen.findByText('an@example.com');
  expect(screen.queryByRole('button', { name: /Thêm khách hàng/ })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Xóa Nguyen An' }));
  fireEvent.click(
    await screen.findByRole('button', { name: 'Xóa khách hàng' })
  );
  await waitFor(() =>
    expect(writes).toHaveBeenCalledWith(
      'delete',
      `/customers/${customer._id}`,
      undefined
    )
  );
});

it.each(['admin', 'staff'] as const)(
  '%s can inspect customer details without checkboxes or an edit action',
  async (role) => {
    const { writes } = mockApi('customers');
    useAuthStore.setState((state) => ({
      user: state.user ? { ...state.user, role } : null,
    }));
    setup(<CustomersPage />);
    await screen.findByText('an@example.com');
    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Chỉnh sửa Nguyen An' })
    ).toBeNull();
    if (role === 'admin')
      expect(
        screen.getByRole('button', { name: 'Xóa Nguyen An' })
      ).toBeTruthy();
    else
      expect(
        screen.queryByRole('button', { name: 'Xóa Nguyen An' })
      ).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Xem Nguyen An' }));
    const dialog = await screen.findByRole('dialog', {
      name: 'Hồ sơ khách hàng',
    });
    expect(within(dialog).getByText('0901234567')).toBeTruthy();
    expect(
      within(dialog).getByText('One, Tỉnh/thành phố, Bang/khu vực')
    ).toBeTruthy();
    expect(within(dialog).getByText(customer._id)).toBeTruthy();
    expect(within(dialog).queryByRole('textbox')).toBeNull();
    expect(writes).not.toHaveBeenCalled();
  }
);

it('creates and updates brands and invalidates the product selector cache', async () => {
  const { writes } = mockApi('brands');
  queryClient.setQueryData(['brands'], [brand]);
  queryClient.setQueryData(['products', 'detail', 'cached-product'], { brand });
  setup(<BrandsPage />);
  await screen.findByText('Acme');
  fireEvent.click(screen.getByRole('link', { name: 'Thêm thương hiệu' }));
  let dialog = await screen.findByRole('form', { name: 'Tạo thương hiệu' });
  fireEvent.change(within(dialog).getByLabelText('Tên thương hiệu'), {
    target: { value: 'New Brand' },
  });
  fireEvent.click(
    within(dialog).getByRole('button', { name: 'Tạo thương hiệu' })
  );
  await waitFor(() =>
    expect(writes).toHaveBeenCalledWith('post', '/brands', {
      name: 'New Brand',
      description: '',
      logoUrl: '',
      isActive: true,
    })
  );
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(queryClient.getQueryState(['brands'])?.isInvalidated).toBe(true);
  expect(
    queryClient.getQueryState(['products', 'detail', 'cached-product'])
      ?.isInvalidated
  ).toBe(true);
  await screen.findByText('Acme');
  fireEvent.click(screen.getByRole('button', { name: 'Edit Acme' }));
  dialog = await screen.findByRole('dialog', { name: 'Chỉnh sửa thương hiệu' });
  fireEvent.change(within(dialog).getByLabelText('Tên thương hiệu'), {
    target: { value: 'Renamed' },
  });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Lưu thay đổi' }));
  await waitFor(() =>
    expect(writes).toHaveBeenCalledWith('put', `/brands/${brand._id}`, {
      name: 'Renamed',
      description: 'Devices',
      logoUrl: '',
      isActive: true,
    })
  );
});

it.each([false, true])(
  'brand deletion keeps the confirmation open only on failure (%s)',
  async (failed) => {
    const { writes } = mockApi('brands', failed);
    setup(<BrandsPage />);
    await screen.findByText('Acme');
    fireEvent.click(screen.getByRole('button', { name: 'Xóa Acme' }));
    fireEvent.click(
      await screen.findByRole('button', { name: 'Xóa thương hiệu' })
    );
    await waitFor(() =>
      expect(writes).toHaveBeenCalledWith(
        'delete',
        `/brands/${brand._id}`,
        undefined
      )
    );
    if (failed)
      expect(
        await within(screen.getByRole('alertdialog')).findByRole('alert')
      ).toBeTruthy();
    else
      await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  }
);

it('generates unpredictable initial credentials instead of role-based defaults', () => {
  const first = getTemporaryPassword('admin');
  const second = getTemporaryPassword('staff');
  expect(first).toMatch(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%]).{8}$/);
  expect(second).toMatch(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%]).{8}$/
  );
  expect(first).not.toBe(second);
});

it('staff can read categories without seeing write actions', async () => {
  mockApi('categories');
  useAuthStore.setState((state) => ({
    user: state.user ? { ...state.user, role: 'staff' } : null,
  }));
  setup(<CategoriesPage />);
  await screen.findByText('Phones');
  expect(screen.queryByRole('button', { name: 'Edit Phones' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Delete Phones' })).toBeNull();
  expect(screen.queryByRole('link', { name: 'Thêm danh mục' })).toBeNull();
});

it('creates, edits and deletes categories using accessible dialogs', async () => {
  const { writes } = mockApi('categories');
  setup(<CategoriesPage />);
  await screen.findByText('Phones');
  fireEvent.click(screen.getByRole('link', { name: 'Thêm danh mục' }));
  let dialog = await screen.findByRole('form', { name: 'Tạo danh mục' });
  fireEvent.change(within(dialog).getByLabelText('Tên danh mục'), {
    target: { value: 'Cases' },
  });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Tạo danh mục' }));
  await waitFor(() =>
    expect(writes).toHaveBeenCalledWith(
      'post',
      '/categories',
      expect.objectContaining({ name: 'Cases', parent: null, isActive: true })
    )
  );
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  fireEvent.click(await screen.findByRole('button', { name: 'Edit Phones' }));
  dialog = await screen.findByRole('dialog', { name: 'Chỉnh sửa danh mục' });
  fireEvent.change(within(dialog).getByLabelText('Tên danh mục'), {
    target: { value: 'New Phones' },
  });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Lưu thay đổi' }));
  await waitFor(() =>
    expect(writes).toHaveBeenCalledWith(
      'put',
      `/categories/${category._id}`,
      expect.objectContaining({ name: 'New Phones' })
    )
  );
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  fireEvent.click(screen.getByRole('button', { name: 'Delete Phones' }));
  dialog = await screen.findByRole('dialog', { name: 'Xóa danh mục?' });
  await within(dialog).findByText('Không tìm thấy sản phẩm liên quan.');
  fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận xóa' }));
  await waitFor(() =>
    expect(writes).toHaveBeenCalledWith(
      'delete',
      `/categories/${category._id}`,
      undefined
    )
  );
});

it('keeps the customer delete dialog open when an order reference prevents deletion', async () => {
  mockApi('customers', true);
  setup(<CustomersPage />);
  await screen.findByText('an@example.com');
  fireEvent.click(screen.getByRole('button', { name: 'Xóa Nguyen An' }));
  fireEvent.click(
    await screen.findByRole('button', { name: 'Xóa khách hàng' })
  );
  expect(
    await within(screen.getByRole('alertdialog')).findByRole('alert')
  ).toBeTruthy();
});

it('allows retrying a failed customer list request without losing the URL', async () => {
  let fail = true;
  api.defaults.adapter = async (config) => {
    if (fail)
      throw new AxiosError('Network unavailable', 'ERR_NETWORK', config);
    return {
      config,
      headers: new AxiosHeaders(),
      status: 200,
      statusText: 'OK',
      data: {
        data: [customer],
        pagination: { page: 2, limit: 10, total: 101, totalPages: 11 },
      },
    };
  };
  setup(<CustomersPage />, '/auth/customers?page=2&search=An');
  fireEvent.click(
    await screen
      .findByRole('button', { name: 'Tải lại khách hàng' })
      .then((button) => {
        fail = false;
        return button;
      })
  );
  expect(await screen.findByText('an@example.com')).toBeTruthy();
  expect(screen.getByTestId('location').textContent).toBe('?page=2&search=An');
});

it('keeps a category conflict in its dialog and allows dismissal with Escape', async () => {
  mockApi('categories', true);
  setup(<CategoriesPage />);
  await screen.findByText('Phones');
  fireEvent.click(screen.getByRole('button', { name: 'Delete Phones' }));
  const dialog = await screen.findByRole('dialog', { name: 'Xóa danh mục?' });
  await within(dialog).findByText('Không tìm thấy sản phẩm liên quan.');
  fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận xóa' }));
  expect(
    await within(dialog).findByText('Referenced by products')
  ).toBeTruthy();
  fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

it.each(['categories', 'brands'] as const)(
  'paginates %s with fixed page size and resets filters',
  async (resource) => {
    const records = Array.from({ length: 25 }, (_, index) => ({
      ...(resource === 'categories' ? category : brand),
      _id: String(index).padStart(24, '0'),
      name: `Item ${index + 1}`,
      slug: `item-${index + 1}`,
      isActive: index % 2 === 0,
    }));
    api.defaults.adapter = async (config) => ({
      config,
      headers: new AxiosHeaders(),
      status: 200,
      statusText: 'OK',
      data: { success: true, data: records },
    });
    const categories = resource === 'categories';
    setup(categories ? <CategoriesPage /> : <BrandsPage />);
    await screen.findByText('Item 1');
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(
      11
    );
    fireEvent.click(
      within(
        screen.getByRole('navigation', {
          name: categories ? 'Phân trang danh mục' : 'Phân trang thương hiệu',
        })
      ).getByRole('button', { name: 'Tiếp' })
    );
    expect(await screen.findByText('Item 11')).toBeTruthy();
    expect(
      screen.queryByLabelText(
        categories ? 'Categories per page' : 'Brands per page'
      )
    ).toBeNull();
    fireEvent.change(
      screen.getByLabelText(categories ? 'Tên danh mục' : 'Tên thương hiệu'),
      { target: { value: 'Item 25' } }
    );
    await waitFor(() =>
      expect(
        within(screen.getByRole('table')).getAllByRole('row')
      ).toHaveLength(2)
    );
    expect(screen.getByText('Item 25')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Trạng thái'), {
      target: { value: 'inactive' },
    });
    expect(
      screen.getByText(
        categories ? 'Không tìm thấy danh mục.' : 'Không tìm thấy thương hiệu.'
      )
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Đặt lại bộ lọc' }));
    expect(await screen.findByText('Item 1')).toBeTruthy();
    expect(screen.getByText('Trang 1 / 3')).toBeTruthy();
  }
);

it.each(['categories', 'brands'] as const)(
  'creates %s on the new route and renders its saved thumbnail',
  async (resource) => {
    URL.createObjectURL = vi.fn(() => 'blob:catalog-preview');
    URL.revokeObjectURL = vi.fn();
    const categories = resource === 'categories';
    const imageField = categories ? 'icon' : 'logoUrl';
    let record: Record<string, unknown> = categories
      ? { ...category }
      : { ...brand };
    const writes = vi.fn();
    api.defaults.adapter = async (config) => {
      if (config.method === 'post') {
        expect(config.data).toBeInstanceOf(FormData);
        const input = Object.fromEntries((config.data as FormData).entries());
        writes(input);
        record = {
          ...record,
          ...input,
          [imageField]: 'https://example.com/thumbnail.png',
        };
      }
      return {
        config,
        headers: new AxiosHeaders(),
        status: 200,
        statusText: 'OK',
        data: {
          success: true,
          data: config.method === 'get' ? [record] : record,
        },
      };
    };
    setup(categories ? <CategoriesPage /> : <BrandsPage />);
    fireEvent.click(
      await screen.findByRole('link', {
        name: categories ? 'Thêm danh mục' : 'Thêm thương hiệu',
      })
    );
    const form = await screen.findByRole('form', {
      name: categories ? 'Tạo danh mục' : 'Tạo thương hiệu',
    });
    fireEvent.change(
      within(form).getByLabelText(
        categories ? 'Tên danh mục' : 'Tên thương hiệu'
      ),
      { target: { value: 'New Thumbnail' } }
    );
    fireEvent.change(
      within(form).getByLabelText(
        categories ? 'Ảnh danh mục' : 'Ảnh thương hiệu'
      ),
      {
        target: {
          files: [new File(['bad'], 'bad.txt', { type: 'text/plain' })],
        },
      }
    );
    fireEvent.click(
      within(form).getByRole('button', {
        name: categories ? 'Tạo danh mục' : 'Tạo thương hiệu',
      })
    );
    expect(
      await within(form).findByText('Chọn ảnh JPG, PNG hoặc WebP.')
    ).toBeTruthy();
    expect(writes).not.toHaveBeenCalled();
    const file = new File(['picture'], 'thumbnail.png', { type: 'image/png' });
    fireEvent.change(
      within(form).getByLabelText(
        categories ? 'Ảnh danh mục' : 'Ảnh thương hiệu'
      ),
      { target: { files: [file] } }
    );
    fireEvent.click(
      within(form).getByRole('button', {
        name: categories ? 'Tạo danh mục' : 'Tạo thương hiệu',
      })
    );
    await waitFor(() =>
      expect(writes).toHaveBeenCalledWith(
        expect.objectContaining({ image: file })
      )
    );
    const image = await screen.findByRole('img', { name: 'New Thumbnail' });
    expect(image.getAttribute('src')).toBe('https://example.com/thumbnail.png');
    fireEvent.error(image);
    expect(
      screen.getByRole('img', { name: 'New Thumbnail: ảnh không khả dụng' })
    ).toBeTruthy();
  }
);

it('previews related products in place without navigating away from category deletion', async () => {
  const requests: unknown[] = [];
  const writes = vi.fn();
  const productId = 'd'.repeat(24);
  api.defaults.adapter = async (config) => {
    if (config.method === 'delete') writes();
    if (config.url === `/products/${productId}`)
      return {
        config,
        headers: new AxiosHeaders(),
        status: 200,
        statusText: 'OK',
        data: {
          data: {
            _id: productId,
            product_name: 'Phone example',
            category: { name: 'Phones' },
            brand: { name: 'Acme' },
            stock: 7,
            price: 250,
            is_active: true,
          },
        },
      };
    if (config.url === '/products') {
      requests.push(config.params);
      return {
        config,
        headers: new AxiosHeaders(),
        status: 200,
        statusText: 'OK',
        data: {
          data: [{ _id: productId, product_name: 'Phone example' }],
          pagination: { total: 11, totalPages: 2 },
        },
      };
    }
    return {
      config,
      headers: new AxiosHeaders(),
      status: 200,
      statusText: 'OK',
      data: { data: [category] },
    };
  };
  setup(<CategoriesPage />);
  fireEvent.click(await screen.findByRole('button', { name: 'Delete Phones' }));
  const dialog = await screen.findByRole('dialog', { name: 'Xóa danh mục?' });
  const product = await within(dialog).findByRole('button', {
    name: 'Phone example',
  });
  fireEvent.click(product);
  const preview = await screen.findByRole('dialog', {
    name: 'Xem trước sản phẩm',
  });
  expect(await within(preview).findByText('Acme')).toBeTruthy();
  expect(within(preview).getByText('7')).toBeTruthy();
  fireEvent.keyDown(preview, { key: 'Escape', code: 'Escape' });
  await waitFor(() =>
    expect(
      screen.queryByRole('dialog', { name: 'Xem trước sản phẩm' })
    ).toBeNull()
  );
  expect(screen.getByRole('dialog', { name: 'Xóa danh mục?' })).toBeTruthy();
  expect(requests).toContainEqual({
    category: category._id,
    page: 1,
    limit: 10,
  });
  expect(within(dialog).queryByRole('link')).toBeNull();
  expect(
    within(dialog)
      .getByRole('button', { name: 'Xác nhận xóa' })
      .hasAttribute('disabled')
  ).toBe(true);
  fireEvent.click(
    within(dialog).getByRole('button', { name: 'Các sản phẩm tiếp theo' })
  );
  await waitFor(() =>
    expect(requests).toContainEqual({
      category: category._id,
      page: 2,
      limit: 10,
    })
  );
  expect(writes).not.toHaveBeenCalled();
});

it('does not treat a related-products network failure as an empty category', async () => {
  let fail = true;
  api.defaults.adapter = async (config) => {
    if (config.url === '/products') {
      if (fail)
        throw new AxiosError('Network unavailable', 'ERR_NETWORK', config);
      return {
        config,
        headers: new AxiosHeaders(),
        status: 200,
        statusText: 'OK',
        data: { data: [], pagination: { total: 0, totalPages: 0 } },
      };
    }
    return {
      config,
      headers: new AxiosHeaders(),
      status: 200,
      statusText: 'OK',
      data: { data: [category] },
    };
  };
  setup(<CategoriesPage />);
  fireEvent.click(await screen.findByRole('button', { name: 'Delete Phones' }));
  const dialog = await screen.findByRole('dialog', { name: 'Xóa danh mục?' });
  const retry = await within(dialog).findByRole('button', {
    name: 'Tải lại sản phẩm',
  });
  expect(
    within(dialog).queryByText('Không tìm thấy sản phẩm liên quan.')
  ).toBeNull();
  expect(
    within(dialog)
      .getByRole('button', { name: 'Xác nhận xóa' })
      .hasAttribute('disabled')
  ).toBe(true);
  fail = false;
  fireEvent.click(retry);
  await within(dialog).findByText('Không tìm thấy sản phẩm liên quan.');
  expect(
    within(dialog)
      .getByRole('button', { name: 'Xác nhận xóa' })
      .hasAttribute('disabled')
  ).toBe(false);
});

it('retries a failed product preview while keeping the category dialog open', async () => {
  let fail = true;
  const id = 'e'.repeat(24);
  api.defaults.adapter = async (config) => {
    let data: unknown = [category];
    if (config.url === '/products')
      return {
        config,
        headers: new AxiosHeaders(),
        status: 200,
        statusText: 'OK',
        data: {
          data: [{ _id: id, product_name: 'Related phone' }],
          pagination: { total: 1, totalPages: 1 },
        },
      };
    if (config.url === `/products/${id}`) {
      if (fail)
        throw new AxiosError('Network unavailable', 'ERR_NETWORK', config);
      data = {
        _id: id,
        product_name: 'Related phone',
        category: { name: 'Phones' },
        brand: { name: 'Preview brand' },
        stock: 2,
        price: 100,
        is_active: true,
      };
    }
    return {
      config,
      headers: new AxiosHeaders(),
      status: 200,
      statusText: 'OK',
      data: { data },
    };
  };
  setup(<CategoriesPage />);
  fireEvent.click(await screen.findByRole('button', { name: 'Delete Phones' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Related phone' }));
  const retry = await screen.findByRole('button', {
    name: 'Tải lại bản xem trước',
  });
  fail = false;
  fireEvent.click(retry);
  expect(await screen.findByText('Preview brand')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Đóng bản xem trước' }));
  await waitFor(() =>
    expect(
      screen.queryByRole('dialog', { name: 'Xem trước sản phẩm' })
    ).toBeNull()
  );
  expect(screen.getByRole('dialog', { name: 'Xóa danh mục?' })).toBeTruthy();
});

it('explains which direct child categories become roots before deleting a parent', async () => {
  const child = {
    ...category,
    _id: 'd'.repeat(24),
    name: 'Child category',
    parent: category._id,
  };
  api.defaults.adapter = async (config) => ({
    config,
    headers: new AxiosHeaders(),
    status: 200,
    statusText: 'OK',
    data:
      config.url === '/products'
        ? {
            data: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
          }
        : { data: [category, child] },
  });
  setup(<CategoriesPage />);
  fireEvent.click(await screen.findByRole('button', { name: 'Delete Phones' }));
  const dialog = await screen.findByRole('dialog', { name: 'Xóa danh mục?' });
  expect(
    await within(dialog).findByText(/Tích chọn danh mục con cần xóa kèm/)
  ).toBeTruthy();
  expect(within(dialog).getByText('Child category')).toBeTruthy();
  expect(
    within(dialog).getByRole('checkbox', { name: 'Child category' })
  ).toHaveProperty('checked', false);
});

it('sends only explicitly selected children and checks product references for the selected set', async () => {
  const child = {
    ...category,
    _id: 'd'.repeat(24),
    name: 'Remove child',
    parent: category._id,
  };
  const survivor = {
    ...category,
    _id: 'e'.repeat(24),
    name: 'Keep child',
    parent: category._id,
  };
  const writes = vi.fn(),
    filters = vi.fn();
  api.defaults.adapter = async (config) => {
    if (config.method === 'delete') writes(config.url, JSON.parse(config.data));
    if (config.url === '/products') filters(config.params.category);
    return {
      config,
      headers: new AxiosHeaders(),
      status: 200,
      statusText: 'OK',
      data:
        config.url === '/products'
          ? { data: [], pagination: { total: 0, totalPages: 0 } }
          : { success: true, data: [category, child, survivor] },
    };
  };
  setup(<CategoriesPage />);
  fireEvent.click(await screen.findByRole('button', { name: 'Delete Phones' }));
  const dialog = await screen.findByRole('dialog', { name: 'Xóa danh mục?' });
  fireEvent.click(
    await within(dialog).findByRole('checkbox', { name: 'Remove child' })
  );
  expect(
    within(dialog).getByRole('checkbox', { name: 'Keep child' })
  ).toHaveProperty('checked', false);
  await waitFor(() =>
    expect(filters).toHaveBeenCalledWith(
      [category._id, child._id].sort().join(',')
    )
  );
  const confirm = within(dialog).getByRole('button', { name: 'Xác nhận xóa' });
  await waitFor(() => expect(confirm).toHaveProperty('disabled', false));
  fireEvent.click(confirm);
  await waitFor(() =>
    expect(writes).toHaveBeenCalledWith(`/categories/${category._id}`, {
      childIds: [child._id],
    })
  );
});
