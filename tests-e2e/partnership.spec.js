
import { test, expect } from '@playwright/test';

test('verify partnership joining flow', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Click on Join Partnership Program button
  const joinBtn = page.locator('text=Join Partnership Program').first();
  await joinBtn.scrollIntoViewIfNeeded();

  // Since we are not logged in, it should show the auth modal
  await joinBtn.click();

  // Verify Auth Modal is visible
  await expect(page.locator('.auth-modal')).toBeVisible();

  // Switch to Register
  await page.locator('.auth-switch').getByRole('button', { name: /Register/i }).click();

  // Verify Phone Number field exists
  await expect(page.getByText(/Phone Number/i)).toBeVisible();
  await expect(page.locator('input[type="tel"]')).toBeVisible();
});
