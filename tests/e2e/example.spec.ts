import { test, expect } from '@playwright/test';

test('homepage has correct title', async ({ page }) => {
  await page.goto('/');
  
  await expect(page).toHaveTitle(/EngageBot/);
  
  await expect(page.locator('h1')).toContainText('Smart Engagement Bot for Content Creators');
  
  await expect(page.locator('text=Unified Comment Feed')).toBeVisible();
  await expect(page.locator('text=AI Response Suggestions')).toBeVisible();
  await expect(page.locator('text=Spam Filter')).toBeVisible();
  await expect(page.locator('text=Analytics Dashboard')).toBeVisible();
});