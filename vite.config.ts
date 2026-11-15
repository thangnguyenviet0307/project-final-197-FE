import path from 'path';
import { readFileSync } from 'node:fs';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, import.meta.dirname, 'VITE_');
  let socketUrl = env.VITE_AI_SOCKET_URL?.trim() || '';
  if (command === 'build' && !socketUrl) {
    // One deployment destination for REST and realtime: do not duplicate a
    // hardcoded Render URL in client source or send upgrades through Vercel.
    const deployment = JSON.parse(
      readFileSync(new URL('./vercel.json', import.meta.url), 'utf8')
    ) as {
      rewrites: { source: string; destination: string }[];
    };
    const api = deployment.rewrites.find(
      (route) => route.source === '/api/v1/:path*'
    );
    if (!api?.destination.endsWith('/api/v1/:path*'))
      throw new Error(
        'Missing production AI socket destination in vercel.json'
      );
    socketUrl = api.destination.replace('/:path*', '/ai/socket');
  }
  if (socketUrl) {
    const url = new URL(socketUrl);
    if (
      (command === 'build' && url.protocol !== 'https:') ||
      !['https:', 'http:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname.replace(/\/$/, '') !== '/api/v1/ai/socket'
    ) {
      throw new Error(
        'VITE_AI_SOCKET_URL must be a public HTTPS /api/v1/ai/socket URL without credentials or query parameters'
      );
    }
  }
  return {
    define: { 'import.meta.env.VITE_AI_SOCKET_URL': JSON.stringify(socketUrl) },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  };
});
