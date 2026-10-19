import DOMPurify from "dompurify"

export function sanitizeDescription(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "b", "em", "i", "u", "s", "h1", "h2", "h3", "ol", "ul", "li", "blockquote", "a", "span"],
    ALLOWED_ATTR: ["href", "class", "data-list"], ALLOW_DATA_ATTR: false,
  })
}
export function descriptionToHtml(value: string): string {
  if (!value) return ""
  if (/<\/?[a-z][^>]*>/i.test(value)) return sanitizeDescription(value)
  const escaped = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
  return `<p>${escaped.replace(/\r?\n/g, "<br>")}</p>`
}
