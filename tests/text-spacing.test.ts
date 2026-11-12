import { expect, it } from 'vitest';
import { normalizeTextSpacing } from '@/utils/text-spacing';

it('normalizes pasted non-breaking spaces without losing prose, line breaks, URLs or literal markup', () => {
  const text =
    'Thông\u00a0tin\u00a0sản phẩm\n\nhttps://example.com/a%C2%A0b\n<script>literal</script>';
  expect(normalizeTextSpacing(text)).toBe(
    'Thông tin sản phẩm\n\nhttps://example.com/a%C2%A0b\n<script>literal</script>'
  );
  expect(normalizeTextSpacing('')).toBe('');
});
