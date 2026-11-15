import { afterEach, expect, it, vi } from 'vitest';
import { resolveAiSocketEndpoint } from '@/features/ai/services/socket-endpoint';
import { socketEndpoint } from '@/features/ai/services/ai.service';
afterEach(() => vi.unstubAllEnvs());
it('connects directly to Render while REST remains behind the Vercel rewrite', () => {
  expect(
    resolveAiSocketEndpoint(
      'https://project-final-197-be.onrender.com/api/v1/ai/socket',
      '/api/v1',
      'https://project-final-197-fe.vercel.app'
    )
  ).toEqual({
    origin: 'https://project-final-197-be.onrender.com',
    path: '/api/v1/ai/socket',
  });
});
it('the chat service honors the production build socket URL independently of the REST base', () => {
  vi.stubEnv(
    'VITE_AI_SOCKET_URL',
    'https://project-final-197-be.onrender.com/api/v1/ai/socket'
  );
  expect(socketEndpoint()).toEqual({
    origin: 'https://project-final-197-be.onrender.com',
    path: '/api/v1/ai/socket',
  });
});
it('keeps development endpoints and relative proxy endpoints working', () => {
  expect(
    resolveAiSocketEndpoint(
      '',
      'http://127.0.0.1:5000/api/v1/',
      'http://127.0.0.1:5173'
    )
  ).toEqual({ origin: 'http://127.0.0.1:5000', path: '/api/v1/ai/socket' });
  expect(
    resolveAiSocketEndpoint(undefined, '/api/v1', 'https://store.example')
  ).toEqual({ origin: 'https://store.example', path: '/api/v1/ai/socket' });
});
it.each([
  'http://backend.example/api/v1/ai/socket',
  'https://secret@backend.example/api/v1/ai/socket',
  'https://backend.example/api/v1/ai/socket?ticket=secret',
  'https://backend.example/api/v1/ai/socket#secret',
  'https://backend.example/api/v1',
  'wss://backend.example/api/v1/ai/socket',
])('rejects insecure or malformed configured endpoints: %s', (configured) => {
  expect(() =>
    resolveAiSocketEndpoint(configured, '/api/v1', 'https://store.example')
  ).toThrow();
});
