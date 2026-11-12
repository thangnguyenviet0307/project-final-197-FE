import { expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ContactPage from '@/pages/storefront/contact';

it('validates contact fields inline without browser popups and revalidates corrections', () => {
  render(
    <MemoryRouter>
      <ContactPage />
    </MemoryRouter>
  );
  const name = screen.getByLabelText(/Họ và tên/) as HTMLInputElement;
  expect(name.form?.noValidate).toBe(true);
  expect(screen.queryAllByRole('alert')).toHaveLength(0);
  fireEvent.submit(name.form!);
  expect(screen.getAllByRole('alert')).toHaveLength(4);
  expect(document.activeElement).toBe(name);
  fireEvent.change(name, { target: { value: 'Nguyễn An' } });
  const email = screen.getByLabelText(/Địa chỉ email/);
  fireEvent.change(email, { target: { value: 'invalid' } });
  expect(screen.getByText('Email không hợp lệ.')).toBeTruthy();
  fireEvent.change(email, { target: { value: 'an@example.com' } });
  fireEvent.change(screen.getByLabelText(/Chủ đề/), {
    target: { value: 'Hỗ trợ' },
  });
  fireEvent.change(screen.getByLabelText(/Lời nhắn/), {
    target: { value: 'Tôi cần hỗ trợ sản phẩm.' },
  });
  fireEvent.submit(name.form!);
  expect(screen.queryAllByRole('alert')).toHaveLength(0);
  expect(screen.getByRole('status').textContent).toContain('Thông tin hợp lệ');
});
