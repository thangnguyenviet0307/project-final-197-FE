/** Socket traffic may go directly to BE; REST keeps same-origin auth cookies. */
export function resolveAiSocketEndpoint(
  configured: string | undefined,
  apiBase: string,
  pageOrigin: string
) {
  const target =
    configured?.trim() || apiBase.replace(/\/$/, '') + '/ai/socket';
  const url = new URL(target, pageOrigin);
  if (
    !['https:', 'http:'].includes(url.protocol) ||
    (new URL(pageOrigin).protocol === 'https:' && url.protocol !== 'https:') ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname.replace(/\/$/, '') !== '/api/v1/ai/socket'
  )
    throw new Error(
      'Địa chỉ kết nối trợ lý không hợp lệ. Vui lòng kiểm tra cấu hình máy chủ.'
    );
  return { origin: url.origin, path: '/api/v1/ai/socket' };
}
