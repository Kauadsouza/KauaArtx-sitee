import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    // mesmo atalho "@/" que o site usa
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['testes/**/*.test.ts'],
    environment: 'node',
  },
});
