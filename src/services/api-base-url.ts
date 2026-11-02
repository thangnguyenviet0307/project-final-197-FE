const loopback = new Set(["localhost", "127.0.0.1", "[::1]"])

export function resolveApiBaseUrl(configured: string, pageOrigin?: string, production = false): string {
  // Vercel forwards this path to BE. Cookies then belong to the FE origin,
  // including when an older Vercel environment still contains the direct BE URL.
  if (production) return "/api/v1"
  const fallback = configured.replace(/\/$/, "")
  if (!pageOrigin) return fallback
  try {
    const api = new URL(configured)
    const page = new URL(pageOrigin)
    // localhost and 127.0.0.1 are different cookie sites. Keep local API cookies
    // on the same host as the page while retaining the configured port/path.
    if (loopback.has(api.hostname) && loopback.has(page.hostname) && api.protocol === page.protocol) {
      api.hostname = page.hostname
      return api.toString().replace(/\/$/, "")
    }
  } catch { /* Preserve relative URLs and let Axios handle configuration errors. */ }
  return fallback
}
