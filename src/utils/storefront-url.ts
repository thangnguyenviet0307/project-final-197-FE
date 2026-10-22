export function storefrontProductUrl(categorySlug: string, productSlug: string): string {
  return `/${encodeURIComponent(categorySlug.trim())}/${encodeURIComponent(productSlug.trim())}`
}
