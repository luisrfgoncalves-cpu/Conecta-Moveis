import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 45000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Mobile 320',
      use: { viewport: { width: 320, height: 640 } },
    },
    {
      name: 'Mobile 390',
      use: { viewport: { width: 390, height: 844 } },
    },
    {
      name: 'Tablet 768',
      use: { viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'Desktop 1280',
      use: { viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
    timeout: 120000,
  },
});

