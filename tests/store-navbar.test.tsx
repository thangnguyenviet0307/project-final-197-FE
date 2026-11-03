import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StoreNavbar } from '@/layout/storefront/store-navbar';
import { useAuthStore } from '@/stores/auth.store';

vi.mock('@/layout/storefront/store-departments-menu', () => ({ StoreDepartmentsMenu: () => <div>Danh mục sản phẩm</div> }));
vi.mock('@/layout/storefront/store-top-bar', () => ({ StoreTopBar: () => <div /> }));
vi.mock('@/features/auth/components/logout-button', () => ({ LogoutButton: () => <button>Đăng xuất</button> }));
beforeEach(() => useAuthStore.setState({ user: null }));

it.each([
  ['/', 'TRANG CHỦ'], ['/shop?search=test', 'KHÁM PHÁ'], ['/shop/product', 'KHÁM PHÁ'],
  ['/bai-viet?type=news', 'TIN TỨC'], ['/bai-viet/article', 'TIN TỨC'], ['/contact', 'LIÊN HỆ'],
])('marks only the current navigation item at %s using black text', (path, label) => {
  render(<MemoryRouter initialEntries={[path]}><StoreNavbar /></MemoryRouter>);
  const active = screen.getByRole('link', { name: label });
  expect(active.getAttribute('aria-current')).toBe('page');
  expect(active.classList.contains('text-black')).toBe(true);
  expect(document.querySelectorAll('a[aria-current="page"]')).toHaveLength(1);
  expect(active.className).not.toContain('bg-');
  expect(active.className).not.toContain('shadow-');
});
it('keeps the same active text on mobile and closes the menu on navigation', () => {
  render(<MemoryRouter initialEntries={['/shop']}><StoreNavbar /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Mở menu điều hướng' }));
  expect(screen.getAllByRole('link', { name: 'KHÁM PHÁ' }).every(link => link.classList.contains('text-black'))).toBe(true);
  fireEvent.click(screen.getAllByRole('link', { name: 'LIÊN HỆ' })[1]);
  expect(screen.getByRole('button', { name: 'Mở menu điều hướng' }).getAttribute('aria-expanded')).toBe('false');
  expect(screen.getByRole('link', { name: 'LIÊN HỆ' }).getAttribute('aria-current')).toBe('page');
});
it('puts departments first and removes duplicated mobile account links and branding', () => {
  render(<MemoryRouter><StoreNavbar /></MemoryRouter>);
  expect(screen.queryByRole('button', { name: 'Đăng xuất' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Mở menu điều hướng' }));
  const menu = document.getElementById('store-mobile-menu')!;
  expect(menu.firstElementChild?.firstElementChild?.textContent).toBe('Danh mục sản phẩm');
  expect(menu.querySelector('a')?.textContent?.trim()).toBe('TRANG CHỦ');
  expect(screen.queryByText('DemoStore')).toBeNull();
  expect(screen.queryByRole('link', { name: 'TÀI KHOẢN CỦA TÔI' })).toBeNull();
  expect(screen.queryByRole('link', { name: 'Đăng nhập' })).toBeNull();
});
it('shows the mobile logout action only for an authenticated customer', () => {
  useAuthStore.setState({ user: { id: 'customer', name: 'Thắng Nguyễn', firstName: 'Thắng', lastName: 'Nguyễn', email: 'test@example.com', accountType: 'customer', mustChangePassword: false } });
  render(<MemoryRouter><StoreNavbar /></MemoryRouter>);
  expect(screen.getByRole('button', { name: 'Đăng xuất' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Mở menu điều hướng' }));
  expect(screen.queryByText('Thắng Nguyễn')).toBeNull();
});
