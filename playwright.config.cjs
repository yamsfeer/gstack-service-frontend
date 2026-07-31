// Playwright E2E 配置：自动启动 Mock API Server + Vite Dev Server
const { defineConfig } = require('@playwright/test');


module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'tests/e2e-report', open: 'never' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:8080',
    headless: true,
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'node mock/server.cjs',
      port: 8000,
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      command: 'pnpm vite --port 8080 --strictPort --host 127.0.0.1',
      port: 8080,
      reuseExistingServer: true,
      timeout: 60000,
    },
  ],
});
