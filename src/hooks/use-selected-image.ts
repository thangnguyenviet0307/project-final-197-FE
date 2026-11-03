import { useEffect, useState } from 'react';
import { validateImageFile } from '@/utils/image-file';

export interface SelectedImage { file: File; url: string }
export function useSelectedImage() {
  const [selected, setSelected] = useState<SelectedImage | null>(null);
  const [error, setError] = useState('');
  useEffect(() => () => { if (selected) URL.revokeObjectURL(selected.url); }, [selected]);
  function select(file: File | null) {
    const invalid = file ? validateImageFile(file) : null;
    if (invalid) { setError(invalid); return; }
    setError(''); setSelected(file ? { file, url: URL.createObjectURL(file) } : null);
  }
  return { selected, error, select };
}
