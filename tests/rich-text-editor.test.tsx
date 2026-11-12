import { afterEach, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { useState } from 'react';
import { RichTextEditor } from '@/components/rich-text-editor';
import * as images from '@/services/editor-image.service';
import { sanitizeDescription, richTextValue } from '@/utils/rich-text';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
function Editor({ submit = vi.fn() }: { submit?: () => void }) {
  const [value, setValue] = useState('');
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <RichTextEditor
        value={value}
        onChange={setValue}
        disabled={false}
        label="Nội dung"
      />
      <button type="submit">Lưu</button>
      <output data-testid="html">{value}</output>
    </form>
  );
}
it('preserves HTTPS images, alignment and size while stripping unsafe URLs, scripts, styles and foreign classes', () => {
  const html = sanitizeDescription(
    '<p class="ql-align-justify evil" style="color:red"><span class="ql-size-large">Text</span><img src="https://example.com/photo.png" onerror="alert(1)"></p><img src="data:image/png;base64,AAAA"><img src="javascript:alert(1)"><script>bad()</script>'
  );
  expect(html).toContain('ql-align-justify');
  expect(html).toContain('ql-size-large');
  expect(html).toContain('https://example.com/photo.png');
  expect(html).not.toMatch(/evil|onerror|style=|data:image|javascript:|script/);
  expect(
    richTextValue('<p><img src="https://example.com/only.png"></p>')
  ).toContain('<img');
  expect(richTextValue('<p><br></p>')).toBe('');
});
it('uploads an image-only document, blocks early save, and retains it in the controlled editor', async () => {
  let finish!: (value: { url: string; publicId: string }) => void;
  vi.spyOn(images, 'uploadEditorImage').mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  const submit = vi.fn();
  render(<Editor submit={submit} />);
  fireEvent.change(screen.getByLabelText('Chọn ảnh cho Nội dung'), {
    target: {
      files: [new File(['image'], 'photo.png', { type: 'image/png' })],
    },
  });
  expect((await screen.findByText('Đang tải ảnh lên…')).textContent).toContain(
    'Đang tải ảnh'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
  expect(submit).not.toHaveBeenCalled();
  finish({ url: 'https://example.com/photo.png', publicId: 'editor/photo' });
  await waitFor(() =>
    expect(screen.getByTestId('html').textContent).toContain(
      'https://example.com/photo.png'
    )
  );
  expect(
    screen
      .getByRole('textbox', { name: 'Nội dung' })
      .querySelector('img')
      ?.getAttribute('src')
  ).toBe('https://example.com/photo.png');
  expect(screen.queryByRole('alert')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
  expect(submit).toHaveBeenCalledOnce();
});
it('rejects invalid images before uploading and exposes all four alignment options', async () => {
  const upload = vi.spyOn(images, 'uploadEditorImage');
  render(<Editor />);
  fireEvent.change(screen.getByLabelText('Chọn ảnh cho Nội dung'), {
    target: {
      files: [new File(['svg'], 'image.svg', { type: 'image/svg+xml' })],
    },
  });
  expect((await screen.findByRole('alert')).textContent).toContain('JPG');
  expect(upload).not.toHaveBeenCalled();
  const align = document.querySelector('select.ql-align') as HTMLSelectElement;
  expect([...align.options].map((option) => option.value)).toEqual([
    '',
    'center',
    'right',
    'justify',
  ]);
});
