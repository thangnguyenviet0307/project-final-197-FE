import { expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ImageFilePicker } from '@/components/image-file-picker';

it('opens the image picker from a Vietnamese button without submitting the warranty form', () => {
  const submit = vi.fn((event) => event.preventDefault());
  const change = vi.fn();
  render(
    <form onSubmit={submit}>
      <label htmlFor="images">Ảnh bảo hành</label>
      <ImageFilePicker
        id="images"
        multiple
        selectionText="Chưa chọn ảnh"
        onChange={change}
      />
    </form>
  );
  const input = screen.getByLabelText('Ảnh bảo hành') as HTMLInputElement;
  const open = vi.spyOn(input, 'click');
  fireEvent.click(screen.getByRole('button', { name: 'Chọn ảnh' }));
  expect(open).toHaveBeenCalledTimes(1);
  expect(submit).not.toHaveBeenCalled();
  const file = new File(['photo'], 'proof.png', { type: 'image/png' });
  fireEvent.change(input, { target: { files: [file] } });
  expect(change).toHaveBeenCalledTimes(1);
  expect(input.multiple).toBe(true);
  expect(screen.getByText('Chưa chọn ảnh')).toBeTruthy();
});
it('disables both the button and native control when uploads are unavailable', () => {
  render(
    <>
      <label htmlFor="images">Ảnh bảo hành</label>
      <ImageFilePicker
        id="images"
        disabled
        selectionText="Đã chọn 5 ảnh"
        onChange={vi.fn()}
      />
    </>
  );
  expect(
    (screen.getByRole('button', { name: 'Chọn ảnh' }) as HTMLButtonElement)
      .disabled
  ).toBe(true);
  expect(
    (screen.getByLabelText('Ảnh bảo hành') as HTMLInputElement).disabled
  ).toBe(true);
});
