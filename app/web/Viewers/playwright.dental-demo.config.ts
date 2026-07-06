import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for recording the dental assignment demo video.
 * Expects the Docker stack (web :8080, API :3000) to already be running.
 */
export default defineConfig({
  testDir: './tests',
  testMatch: 'DentalDemo.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 300_000,
  outputDir: './tests/dental-demo-results',
  reporter: [['list']],
  use: {
    baseURL: process.env.DENTAL_DEMO_URL ?? 'http://localhost:8080',
    trace: 'off',
    video: 'on',
    screenshot: 'off',
    testIdAttribute: 'data-cy',
    actionTimeout: 30_000,
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      args: ['--use-gl=egl'],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], deviceScaleFactor: 1 },
    },
  ],
});
