import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ImageUploadField } from '@/components/image-upload-field';

it('opens the file picker only from the product-style choose button', () => {
  render(<ImageUploadField id="cover" label="Cover" selected={null} error="" disabled={false} onSelect={vi.fn()} />);
  const input = screen.getByLabelText('Cover') as HTMLInputElement;
  const click = vi.spyOn(input, 'click').mockImplementation(() => {});
  expect(input.hidden).toBe(true);
  const button = screen.getByRole('button', { name: 'Chọn cover' });
  expect(button.classList.contains('cursor-pointer')).toBe(true);
  fireEvent.click(button.parentElement!);
  fireEvent.click(screen.getByText('Chưa chọn ảnh'));
  expect(click).not.toHaveBeenCalled();
  fireEvent.click(button);
  expect(click).toHaveBeenCalledTimes(1);
});
