import { afterEach, expect, it } from 'vitest';
import { AxiosHeaders } from 'axios';
import { api } from '@/services/api';

const original = api.defaults.adapter;
afterEach(() => {
  api.defaults.adapter = original;
});
const paths = [
  '/categories/id',
  '/brands/id',
  '/customers/id',
  '/users/id',
  '/products/id',
  '/orders/id',
  '/articles/id',
  '/articles/category-options/id',
  '/hero-slides/id',
  '/products/id/reviews/review',
  '/products/id/images/image',
  '/support/admin/documents/privacy',
];

it.each(paths)(
  'rejects an HTML 200 response instead of reporting successful deletion: %s',
  async (path) => {
    api.defaults.adapter = async (config) => ({
      config,
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders({ 'content-type': 'text/html' }),
      data: '<html>SPA fallback</html>',
    });
    await expect(api.delete(path)).rejects.toThrow(/API/);
  }
);

it('rejects success:false and accepts JSON confirmation or HTTP 204', async () => {
  api.defaults.adapter = async (config) => ({
    config,
    status: 200,
    statusText: 'OK',
    headers: new AxiosHeaders(),
    data: { success: false },
  });
  await expect(api.delete('/categories/id')).rejects.toThrow();
  api.defaults.adapter = async (config) => ({
    config,
    status: 200,
    statusText: 'OK',
    headers: new AxiosHeaders(),
    data: { success: true },
  });
  await expect(api.delete('/categories/id')).resolves.toHaveProperty(
    'status',
    200
  );
  api.defaults.adapter = async (config) => ({
    config,
    status: 204,
    statusText: 'No Content',
    headers: new AxiosHeaders(),
    data: '',
  });
  await expect(api.delete('/categories/id')).resolves.toHaveProperty(
    'status',
    204
  );
});
