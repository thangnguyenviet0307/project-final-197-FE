import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CustomerOrderCard } from '@/features/orders/components/customer-order-card';
import { WarrantyCreateForm } from '@/features/support/components/warranty-create-form';
import { WarrantyDetailPanel } from '@/features/support/components/warranty-detail';
import { isWarrantyRequestEligible } from '@/features/support/utils/warranty-eligibility';
import type { WarrantyDetail } from '@/features/support/types/support';
import type { CustomerOrder } from '@/features/orders/types/customer-orders';
import { useAuthStore } from '@/stores/auth.store';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  upload: vi.fn(),
  update: vi.fn(),
  eligible: vi.fn(),
  refetch: vi.fn(),
  detail: null as WarrantyDetail | null,
  existing: [] as Array<{ orderId: string }>,
}));
vi.mock('@/features/orders/components/customer-order-cancel', () => ({
  CustomerOrderCancel: () => null,
}));
vi.mock('@/features/support/hooks/use-support', () => ({
  useEligibleWarrantyOrders: (page: number, orderId?: string) => {
    mocks.eligible(page, orderId);
    return {
      isPending: false,
      data: {
        data: [
          {
            _id: 'a'.repeat(24),
            orderDate: '2026-11-03T00:00:00Z',
            orderCode: 'ORDER-1',
            items: [
              {
                itemIndex: 0,
                productName: 'Sản phẩm đã mua',
                variantName: 'Xanh',
                quantity: 1,
              },
            ],
          },
        ],
        pagination: { totalPages: 1 },
      },
    };
  },
  useWarranty: () => ({
    data: mocks.detail,
    isPending: false,
    refetch: mocks.refetch,
  }),
  useWarranties: () => ({
    data: { data: mocks.existing, pagination: { totalPages: 1 } },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useSupportMutations: () => ({
    create: { mutateAsync: mocks.create, isPending: false },
    upload: { mutateAsync: mocks.upload, isPending: false },
    update: { mutateAsync: mocks.update, isPending: false },
  }),
}));
beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({ user: null });
  mocks.existing = [];
  mocks.detail = {
    _id: 'b'.repeat(24),
    __v: 2,
    orderCode: 'ORDER-1',
    productName: 'Sản phẩm đã mua',
    variantName: 'Xanh',
    status: 'submitted',
    description: 'Màn hình không hoạt động',
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
    history: [],
    images: [],
    handlerId: null,
  };
  URL.createObjectURL = vi.fn(() => 'blob:warranty-preview');
  URL.revokeObjectURL = vi.fn();
});
const wrap = (element: React.ReactNode) => (
  <MemoryRouter>{element}</MemoryRouter>
);
it('offers a warranty link for each item only after its order is completed', () => {
  const order: CustomerOrder = {
    _id: 'a'.repeat(24),
    orderCode: 'ORDER-1',
    orderDate: '2026-11-01',
    orderStatus: 4,
    totalAmount: 100,
    street: '',
    city: '',
    state: '',
    orderItems: [
      { productName: 'Phone', quantity: 1, price: 100, discount: 0 },
    ],
  };
  const view = render(wrap(<CustomerOrderCard order={order} />));
  expect(
    screen.getByRole('link', { name: 'Yêu cầu bảo hành' }).getAttribute('href')
  ).toBe(`/account/warranty?new=1&order=${order._id}&item=0`);
  view.rerender(
    wrap(<CustomerOrderCard order={{ ...order, orderStatus: 2 }} />)
  );
  expect(screen.queryByRole('link', { name: 'Yêu cầu bảo hành' })).toBeNull();
});
it('hides the warranty action when a customer already has a request for the order', () => {
  const order: CustomerOrder = {
    _id: 'a'.repeat(24),
    orderCode: 'ORDER-1',
    orderDate: '2026-11-01',
    orderStatus: 4,
    totalAmount: 100,
    street: '',
    city: '',
    state: '',
    orderItems: [
      { productName: 'Phone', quantity: 1, price: 100, discount: 0 },
    ],
  };
  mocks.existing = [{ orderId: order._id }];
  render(wrap(<CustomerOrderCard order={order} />));
  expect(screen.queryByRole('link', { name: 'Yêu cầu bảo hành' })).toBeNull();
});
it('keeps warranty requests within the seven-day creation window and blocks stale orders', () => {
  const now = new Date('2026-11-10T00:00:00Z');
  expect(
    isWarrantyRequestEligible(
      'a'.repeat(24),
      '2026-11-03T00:00:00Z',
      new Set(),
      now
    )
  ).toBe(true);
  expect(
    isWarrantyRequestEligible(
      'b'.repeat(24),
      '2026-10-25T00:00:00Z',
      new Set(),
      now
    )
  ).toBe(false);
  expect(
    isWarrantyRequestEligible(
      'c'.repeat(24),
      '2026-11-03T00:00:00Z',
      new Set(['c'.repeat(24)]),
      now
    )
  ).toBe(false);
});
it('preselects the server-confirmed purchased item and creates its request', async () => {
  mocks.create.mockResolvedValue({ _id: 'b'.repeat(24) });
  const created = vi.fn();
  render(
    wrap(
      <WarrantyCreateForm
        initialOrderId={'a'.repeat(24)}
        initialItemIndex={0}
        onCreated={created}
        onCancel={vi.fn()}
      />
    )
  );
  expect(mocks.eligible).toHaveBeenCalledWith(1, 'a'.repeat(24));
  expect((screen.getByRole('radio') as HTMLInputElement).checked).toBe(true);
  fireEvent.change(screen.getByLabelText('Mô tả tình trạng lỗi'), {
    target: { value: 'Màn hình không hoạt động' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }));
  await waitFor(() => expect(created).toHaveBeenCalledWith('b'.repeat(24)));
  expect(mocks.create).toHaveBeenCalledWith(
    expect.objectContaining({
      orderId: 'a'.repeat(24),
      itemIndex: 0,
      description: 'Màn hình không hoạt động',
    })
  );
});
it('submits chosen photos and retries only unfinished uploads without creating another request', async () => {
  let sequence = 0;
  URL.createObjectURL = vi.fn(() => `blob:photo-${++sequence}`);
  mocks.create.mockResolvedValue({ _id: 'b'.repeat(24) });
  mocks.upload
    .mockResolvedValueOnce(mocks.detail)
    .mockRejectedValueOnce(new Error('Mất kết nối'))
    .mockResolvedValueOnce(mocks.detail);
  const created = vi.fn();
  render(
    wrap(
      <WarrantyCreateForm
        initialOrderId={'a'.repeat(24)}
        initialItemIndex={0}
        onCreated={created}
        onCancel={vi.fn()}
      />
    )
  );
  const first = new File(['one'], 'one.png', { type: 'image/png' });
  const second = new File(['two'], 'two.png', { type: 'image/png' });
  fireEvent.change(screen.getByLabelText(/Ảnh tình trạng sản phẩm/), {
    target: { files: [first, second] },
  });
  expect(screen.getAllByRole('img')).toHaveLength(2);
  expect(mocks.upload).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Mô tả tình trạng lỗi'), {
    target: { value: 'Màn hình không hoạt động' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }));
  await screen.findByText(/Yêu cầu đã được tạo nhưng ảnh chưa tải lên đầy đủ/);
  expect(created).not.toHaveBeenCalled();
  expect(screen.getByText('Đã tải lên')).toBeTruthy();
  fireEvent.click(
    screen.getByRole('button', { name: 'Thử tải các ảnh còn lại' })
  );
  await waitFor(() => expect(created).toHaveBeenCalledWith('b'.repeat(24)));
  expect(mocks.create).toHaveBeenCalledTimes(1);
  expect(mocks.upload.mock.calls.map((call) => call[0].file)).toEqual([
    first,
    second,
    second,
  ]);
});
it('rejects oversized/unsupported images and enforces the five-image limit before creating a request', () => {
  render(wrap(<WarrantyCreateForm onCreated={vi.fn()} onCancel={vi.fn()} />));
  const input = screen.getByLabelText(/Ảnh tình trạng sản phẩm/);
  fireEvent.change(input, {
    target: { files: [new File(['bad'], 'bad.gif', { type: 'image/gif' })] },
  });
  expect(screen.getByText('Chọn ảnh JPG, PNG hoặc WebP.')).toBeTruthy();
  const large = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', {
    type: 'image/png',
  });
  fireEvent.change(input, { target: { files: [large] } });
  expect(screen.getByText('Mỗi ảnh không được vượt quá 5 MB.')).toBeTruthy();
  fireEvent.change(input, {
    target: {
      files: Array.from(
        { length: 6 },
        (_, index) => new File(['image'], `${index}.png`, { type: 'image/png' })
      ),
    },
  });
  expect(screen.getByText('Chỉ chọn tối đa 5 ảnh.')).toBeTruthy();
  expect(mocks.create).not.toHaveBeenCalled();
});
it('does not preselect a forged item that was not returned by the server', () => {
  render(
    wrap(
      <WarrantyCreateForm
        initialOrderId={'c'.repeat(24)}
        initialItemIndex={0}
        onCreated={vi.fn()}
        onCancel={vi.fn()}
      />
    )
  );
  expect((screen.getByRole('radio') as HTMLInputElement).checked).toBe(false);
  expect(
    (screen.getByRole('button', { name: 'Gửi yêu cầu' }) as HTMLButtonElement)
      .disabled
  ).toBe(true);
});
it('keeps the exact selected photo for an uncertain upload retry and clears it on success', async () => {
  mocks.upload
    .mockRejectedValueOnce(new Error('Mất kết nối'))
    .mockResolvedValueOnce(mocks.detail);
  render(wrap(<WarrantyDetailPanel id={'b'.repeat(24)} admin={false} />));
  const file = new File(['picture'], 'proof.png', { type: 'image/png' });
  fireEvent.change(screen.getByLabelText(/Bổ sung ảnh/), {
    target: { files: [file] },
  });
  expect(
    screen.getByRole('img', { name: 'Ảnh đang chọn để gửi bảo hành' })
  ).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Tải ảnh lên' }));
  await screen.findByText('Mất kết nối');
  expect(screen.getByText('proof.png')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Tải ảnh lên' }));
  await screen.findByText('Đã bổ sung ảnh vào yêu cầu bảo hành.');
  expect(mocks.upload.mock.calls[0][0].file).toBe(file);
  expect(mocks.upload.mock.calls[1][0].file).toBe(file);
  expect(
    screen.queryByRole('img', { name: 'Ảnh đang chọn để gửi bảo hành' })
  ).toBeNull();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:warranty-preview');
});
it('retains the employee response and original version when another actor changes the request', async () => {
  useAuthStore.setState({
    user: {
      id: 'staff',
      firstName: 'A',
      lastName: 'B',
      name: 'B A',
      email: 'staff@example.com',
      accountType: 'user',
      role: 'staff',
      mustChangePassword: false,
    },
  });
  mocks.detail = { ...mocks.detail!, status: 'reviewing', handlerId: 'staff' };
  mocks.update.mockRejectedValue({
    isAxiosError: true,
    response: { status: 409, data: { message: 'Conflict' } },
  });
  const view = render(wrap(<WarrantyDetailPanel id={'b'.repeat(24)} admin />));
  fireEvent.change(screen.getByLabelText('Phản hồi cho khách hàng'), {
    target: { value: 'Cần sửa màn hình' },
  });
  mocks.detail = { ...mocks.detail, __v: 8, status: 'resolved' };
  view.rerender(wrap(<WarrantyDetailPanel id={'b'.repeat(24)} admin />));
  fireEvent.click(screen.getByRole('button', { name: 'Cập nhật trạng thái' }));
  await waitFor(() =>
    expect(
      (
        screen.getByRole('button', {
          name: 'Cập nhật trạng thái',
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true)
  );
  expect(mocks.update).toHaveBeenCalledWith({
    id: 'b'.repeat(24),
    status: 'repairing',
    note: 'Cần sửa màn hình',
    expectedVersion: 2,
  });
  expect(
    (screen.getByLabelText('Phản hồi cho khách hàng') as HTMLTextAreaElement)
      .value
  ).toBe('Cần sửa màn hình');
});
it('prevents staff from updating another employees accepted request', () => {
  useAuthStore.setState({
    user: {
      id: 'staff',
      firstName: 'A',
      lastName: 'B',
      name: 'B A',
      email: 'staff@example.com',
      accountType: 'user',
      role: 'staff',
      mustChangePassword: false,
    },
  });
  mocks.detail = {
    ...mocks.detail!,
    status: 'reviewing',
    handlerId: 'other-staff',
  };
  render(wrap(<WarrantyDetailPanel id={'b'.repeat(24)} admin />));
  expect(screen.queryByLabelText('Phản hồi cho khách hàng')).toBeNull();
  expect(screen.getByText(/Yêu cầu do nhân viên khác phụ trách/)).toBeTruthy();
});
