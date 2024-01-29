import { defineConfig } from '@solidjs/start/config';

export default defineConfig({
  start: {
    server: { preset: 'bun' },
    ssr: true,
    middleware: './src/lib/auth/solidStartAuthMiddleware.ts',
  },
});
