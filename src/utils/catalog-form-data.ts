export function catalogFormData(values: Record<string, unknown>, image?: File): Record<string, unknown> | FormData {
  if (!image) return values;
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) form.append(key, value === null ? 'null' : String(value));
  }
  form.append('image', image);
  return form;
}
