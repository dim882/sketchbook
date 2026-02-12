import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['src/ui/**'],
    setupFiles: ['./src/__tests__/setup.ts'],
    mockReset: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.utils.ts', 'src/watch.ts'],
      exclude: ['src/**/*.test.ts', 'src/ui/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './src/__tests__'),
      '@fixtures': path.resolve(__dirname, './src/__tests__/fixtures'),
      '@helpers': path.resolve(__dirname, './src/__tests__/helpers'),
    },
  },
});
