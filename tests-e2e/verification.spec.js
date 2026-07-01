const { test, expect } = require('@playwright/test');

test('verify new UI elements in Global DesignAI Studio', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Check for the Posters AI button
  const posterModeBtn = page.locator('button:has-text("Posters AI")');
  await expect(posterModeBtn).toBeVisible();

  // Enter a prompt and generate
  await page.fill('input.input-field', 'A futuristic city');
  await page.click('button:has-text("Generate Design")');

  // Wait for generation (AI insight box should appear)
  const insightBox = page.locator('.ai-insight-box');
  await expect(insightBox).toBeVisible({ timeout: 10000 });

  // Check for download buttons
  const downloadImgBtn = page.locator('button:has-text("Download Image")');
  await expect(downloadImgBtn).toBeVisible();

  // Check for copy button
  // The title might be translated (e.g., "Copy" in English)
  const copyBtn = page.locator('.icon-btn');
  await expect(copyBtn.first()).toBeVisible();

  // Check if history panel is visible after generation
  const historySection = page.locator('.history-section');
  await expect(historySection).toBeVisible();

  // Verify history item
  const historyItem = page.locator('.history-item');
  await expect(historyItem).toBeVisible();
  await expect(historyItem.locator('.history-prompt')).toHaveText('A futuristic city');

  // Take a screenshot
  await page.screenshot({ path: 'verification-screenshot.png', fullPage: true });
});
