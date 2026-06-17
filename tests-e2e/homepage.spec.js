const { test, expect } = require('@playwright/test');

test('homepage has Global DesignAI Studio title', async ({ page }) => {
  await page.goto(process.env.FRONTEND_URL || 'http://localhost:3000');
  await expect(page).toHaveTitle(/Global DesignAI Studio/);
});

test('renders main sections', async ({ page }) => {
  await page.goto(process.env.FRONTEND_URL || 'http://localhost:3000');
  const logo = page.locator('text=Global DesignAI Studio').first();
  await expect(logo).toBeVisible();

  const tryForFree = page.locator('text=Try for Free').first();
  await expect(tryForFree).toBeVisible();
});
