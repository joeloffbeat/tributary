import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    exclude: ['tests/e2e/**'],
    setupFiles: ['tests/integration/tributary/setup.ts'],
    globals: true,
    testTimeout: 30000,
    hookTimeout: 10000,
    coverage: {
      provider: 'v8',
      include: [
        'app/api/tributary/**/*.ts',
        'lib/services/tributary*.ts',
        'lib/services/tributary/**/*.ts',
      ],
      exclude: ['**/*.test.ts', '**/types.ts'],
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },
    pool: 'forks',
    isolate: true,
    reporters: ['default'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
