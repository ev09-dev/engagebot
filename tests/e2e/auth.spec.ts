import { test, expect } from '@playwright/test';

test('sign up and sign in flow', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/');
  
  // Check that the home page loads correctly
  await expect(page).toHaveTitle(/EngageBot/);
  await expect(page.locator('h1')).toContainText('Smart Engagement Bot for Content Creators');
  
  // Click on Get Started button
  await page.click('text=Get Started');
  
  // Should be redirected to dashboard but then to sign in
  await expect(page).toHaveURL('/dashboard');
  
  // Check that sign in form is present
  await expect(page.locator('h2')).toContainText('Sign In to EngageBot');
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  
  // Try to sign up with a new email
  const testEmail = `test-${Date.now()}@example.com`;
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', 'testpassword123');
  
  // Click sign up button
  await page.click('button:has-text("Sign Up")');
  
  // Check for success message
  await expect(page.locator('text=Check your email for the confirmation link')).toBeVisible();
  
  // Now try to sign in with the same credentials
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', 'testpassword123');
  
  // Click sign in button
  await page.click('button:has-text("Sign In")');
  
  // Should show an error since the email is not confirmed
  await expect(page.locator('text=Email not confirmed')).toBeVisible();
});

test('dashboard navigation', async ({ page }) => {
  // Mock authentication by setting a session token
  // In a real test, you would actually authenticate
  await page.context().addCookies([
    {
      name: 'sb-access-token',
      value: 'mock-token',
      domain: 'localhost',
      path: '/',
    },
    {
      name: 'sb-refresh-token',
      value: 'mock-refresh-token',
      domain: 'localhost',
      path: '/',
    },
  ]);
  
  // Navigate to dashboard
  await page.goto('/dashboard');
  
  // Check that dashboard loads
  await expect(page.locator('h1')).toContainText('Dashboard');
  
  // Test navigation between tabs
  await page.click('text=Analytics');
  await expect(page.locator('h2')).toContainText('Analytics');
  
  await page.click('text=Social Accounts');
  await expect(page.locator('h2')).toContainText('Social Accounts');
  
  await page.click('text=Voice Tone');
  await expect(page.locator('h2')).toContainText('Voice Tone Calibration');
  
  await page.click('text=Automation');
  await expect(page.locator('h2')).toContainText('Automation');
  
  // Go back to comments
  await page.click('text=Comments');
  await expect(page.locator('h2')).toContainText('Comments');
});