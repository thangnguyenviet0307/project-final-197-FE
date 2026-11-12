/** Allow pasted prose to wrap at spaces without changing line breaks. */
export function normalizeTextSpacing(value: string): string {
  return value.replace(/\u00a0/g, ' ');
}
