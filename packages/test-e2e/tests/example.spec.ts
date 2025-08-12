import { test } from '../lib/test';
import { expect, type Page } from '@playwright/test';

test('Empty state', async ({ page, baseURL }) => {
  await page.goto(baseURL);

  test.step('Assertions', async () => {
    await expect(page.locator('[data-test-loading]')).toBeVisible;
    await expect(page.locator('[data-test-emmpty]')).toBeVisible;
  });
});
