import { afterEach, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { StoreLayout } from '@/layout/storefront/store-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { readFileSync } from 'node:fs';
const css = readFileSync('src/components/ui/storefront-dialog.css', 'utf8');

vi.mock('@/layout/storefront/store-header', () => ({ StoreHeader: () => null }));
vi.mock('@/layout/storefront/store-navbar', () => ({ StoreNavbar: () => null }));
vi.mock('@/layout/storefront/store-footer', () => ({ StoreFooter: () => null }));
afterEach(() => document.documentElement.classList.remove('dark'));

function Popup() {
  return <Dialog defaultOpen><DialogContent><DialogTitle>Hủy đơn hàng</DialogTitle><DialogDescription>Xác nhận hủy đơn?</DialogDescription><DialogFooter><Button variant="outline">Giữ đơn hàng</Button><Button variant="destructive">Xác nhận hủy</Button></DialogFooter></DialogContent></Dialog>;
}
it('applies high-contrast storefront styling through the portal even when the app root is dark', async () => {
  document.documentElement.classList.add('dark');
  const { container } = render(<><style>{css}</style><MemoryRouter><Routes><Route element={<StoreLayout />}><Route path="/" element={<Popup />} /></Route></Routes></MemoryRouter></>);
  const popup = await screen.findByRole('dialog', { name: 'Hủy đơn hàng' });
  expect(popup.hasAttribute('data-storefront-dialog')).toBe(true);
  expect(container.contains(popup)).toBe(false);
  const confirm = screen.getByRole('button', { name: 'Xác nhận hủy' });
  expect(css).toContain('background-color: #b91c1c');
  expect(confirm.getAttribute('data-variant')).toBe('destructive');
  expect(getComputedStyle(confirm).backgroundColor).toBe('rgb(185, 28, 28)');
  expect(getComputedStyle(confirm).color).toBe('rgb(255, 255, 255)');
  expect(getComputedStyle(popup.querySelector('[data-slot="dialog-footer"]')!).backgroundColor).toBe('rgb(249, 250, 251)');
  const cancel = screen.getByRole('button', { name: 'Giữ đơn hàng' });
  expect(getComputedStyle(cancel).backgroundColor).toBe('rgb(255, 255, 255)');
  expect(getComputedStyle(cancel).color).toBe('rgb(55, 65, 81)');
  expect(document.querySelector('[data-storefront-overlay]')).toBeTruthy();
});
it('does not apply storefront overrides to administrative dialogs', async () => {
  document.documentElement.classList.add('dark');
  render(<><style>{css}</style><Popup /></>);
  const popup = await screen.findByRole('dialog', { name: 'Hủy đơn hàng' });
  expect(popup.hasAttribute('data-storefront-dialog')).toBe(false);
  expect(document.querySelector('[data-storefront-overlay]')).toBeNull();
});
