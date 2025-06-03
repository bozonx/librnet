import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Ищем тесты только в директории test
    include: ['test/**/*.test.ts'],
    // Исключаем все остальные директории
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
    // Включаем подробный вывод
    reporters: ['verbose'],
    // Включаем coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['test/**/*.ts'],
    },
  },
});
