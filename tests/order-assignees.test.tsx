import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { HandlerPicker, StartOrderAction } from '@/features/orders/components/start-order-action';
import { useAuthStore } from '@/stores/auth.store';
import type { Role } from '@/features/auth/types/auth';
import type { Order } from '@/features/orders/types/orders';

const mocks = vi.hoisted(() => ({ start: vi.fn() }));
vi.mock('@/features/orders/hooks/use-orders', () => ({ useStartOrder: () => ({ mutate: mocks.start, isPending: false, reset: vi.fn() }) }));
vi.mock('@/features/orders/hooks/use-order-assignees', () => ({ useOrderAssignees: () => ({ data: { data: [
  { _id: 'b'.repeat(24), firstName: 'Admin', lastName: 'Other', email: 'admin@example.com', role: 'admin' },
  { _id: 'c'.repeat(24), firstName: 'Staff', lastName: 'Employee', email: 'staff@example.com', role: 'staff' },
  { _id: 'd'.repeat(24), firstName: 'Owner', lastName: 'Other', email: 'owner@example.com', role: 'super_admin' },
], pagination: { totalPages: 1 } }, isPending: false, isFetching: false }) }));
function signIn(role: Role) { useAuthStore.setState({ user: { id: 'a'.repeat(24), role, firstName: 'Thắng', lastName: 'Nguyễn', name: 'Nguyễn Thắng', email: 'self@example.com', mustChangePassword: false } }); }
beforeEach(() => vi.clearAllMocks());
it('Admin can select self or Staff, while peer Admin and Super Admin are excluded', () => {
  signIn('admin');
  render(<HandlerPicker selected="" onSelect={vi.fn()} disabled={false} />);
  expect(screen.getByRole('radio', { name: /Tự nhận đơn/ })).toBeTruthy();
  expect(screen.getByRole('radio', { name: /Employee Staff/ })).toBeTruthy();
  expect(screen.queryByRole('radio', { name: /Other Admin/ })).toBeNull();
  expect(screen.queryByRole('radio', { name: /Other Owner/ })).toBeNull();
});
it('Super Admin can select self, Admin and Staff', () => {
  signIn('super_admin');
  const select = vi.fn();
  render(<HandlerPicker selected="" onSelect={select} disabled={false} />);
  fireEvent.click(screen.getByRole('radio', { name: /Other Admin/ }));
  expect(select).toHaveBeenCalledWith('b'.repeat(24));
  expect(screen.getByRole('radio', { name: /Employee Staff/ })).toBeTruthy();
  expect(screen.getByRole('radio', { name: /Tự nhận đơn/ })).toBeTruthy();
  expect(screen.queryByRole('radio', { name: /Other Owner/ })).toBeNull();
});
it.each(['admin', 'super_admin'] as const)('%s can immediately confirm self-assignment', role => {
  signIn(role);
  const order = { _id: 'e'.repeat(24), orderStatus: 1, userId: null } as Order;
  render(<StartOrderAction order={order} />);
  fireEvent.click(screen.getByRole('button', { name: 'Phân công và bắt đầu' }));
  expect((screen.getByRole('radio', { name: /Tự nhận đơn/ }) as HTMLInputElement).checked).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Xác nhận bắt đầu' }));
  expect(mocks.start).toHaveBeenCalledWith({ id: order._id, userId: 'a'.repeat(24) }, expect.any(Object));
});
