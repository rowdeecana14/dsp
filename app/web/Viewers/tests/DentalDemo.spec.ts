import { expect, test } from '@playwright/test';

const STUDY_UID = '1.3.6.1.4.1.25403.345050719074.3824.20170125095438.5';
const LOGIN_EMAIL = 'admin@example.com';
const LOGIN_PASSWORD = 'change-me-strongly';

test.describe('Dental assignment demo walkthrough', () => {
  test('records login, dental UI, measurements, and logout flow', async ({ page }) => {
    test.setTimeout(300_000);

    await page.goto('/login');
    await expect(page.getByTestId('dental-login-page')).toBeVisible();
    await page.getByTestId('dental-login-email').fill(LOGIN_EMAIL);
    await page.getByTestId('dental-login-password').fill(LOGIN_PASSWORD);
    await page.getByTestId('dental-login-submit').click();
    await page.waitForURL('**/', { timeout: 60_000 });

    await page.goto(`/dental/ohif?StudyInstanceUIDs=${STUDY_UID}`);
    await expect(page.getByTestId('practice-header')).toBeVisible({ timeout: 120_000 });
    await expect(page.getByTestId('practice-name')).toContainText('Bright Smile Dental');
    await expect(page.getByTestId('dental-patient-info')).toBeVisible();
    await expect(page.getByTestId('tooth-selector')).toBeVisible();

    await page.getByTestId('dental-theme-toggle').getByRole('button', { name: 'Standard' }).click();
    await page.waitForTimeout(800);
    await page.getByTestId('dental-theme-toggle').getByRole('button', { name: 'Dental' }).click();
    await page.waitForTimeout(800);

    await page.getByRole('button', { name: 'Measurements' }).click();
    await expect(page.getByTestId('dental-measurements-palette')).toBeVisible();
    await page.getByRole('button', { name: 'PA length' }).click();

    const viewport = page.locator('[data-cy="viewport-pane"]').first();
    await expect(viewport).toBeVisible({ timeout: 60_000 });
    const box = await viewport.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width * 0.4, box.y + box.height * 0.35);
      await page.mouse.click(box.x + box.width * 0.55, box.y + box.height * 0.65);
    }

    await expect(page.getByTestId('dental-measurements-panel')).toBeVisible();
    await page.getByTestId('dental-measurement-search').fill('PA');
    await page.getByTestId('dental-sort-field').selectOption('label');
    await page.waitForTimeout(500);

    const downloadPromise = page.waitForEvent('download', { timeout: 15_000 }).catch(() => null);
    await page.getByTestId('export-json-btn').click();
    const download = await downloadPromise;
    if (download) {
      expect(download.suggestedFilename()).toMatch(/dental-measurements-.*\.json/);
    }

    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL('**/login**', { timeout: 30_000 });
    await expect(page.getByTestId('dental-login-page')).toBeVisible();
  });
});
