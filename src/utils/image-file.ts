export function validateImageFile(file: File): string | null {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Chọn ảnh JPG, PNG hoặc WebP.';
  if (file.size > 5 * 1024 * 1024) return 'Mỗi ảnh không được vượt quá 5 MB.';
  return null;
}
