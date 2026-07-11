import { test, expect } from '@playwright/test'

test.describe('OAuth Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/api/auth/user', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          user: {
            id: 'user-123',
            email: 'test@example.com',
          },
        }),
      })
    })
  })

  test('initiates Instagram OAuth flow', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Navigate to Accounts tab
    await page.click('text=Social Accounts')
    
    // Click Connect Instagram button
    await page.click('text=Connect Instagram')
    
    // Verify redirect to Instagram OAuth
    await expect(page).toHaveURL(/instagram\.com|\/api\/auth\/instagram/)
  })

  test('initiates TikTok OAuth flow', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Navigate to Accounts tab
    await page.click('text=Social Accounts')
    
    // Click Connect TikTok button
    await page.click('text=Connect TikTok')
    
    // Verify redirect to TikTok OAuth
    await expect(page).toHaveURL(/tiktok\.com|\/api\/auth\/tiktok/)
  })

  test('handles OAuth callback successfully', async ({ page }) => {
    // Mock successful OAuth callback
    await page.route('**/api/auth/instagram/callback', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          account: {
            id: 'instagram-123',
            platform: 'instagram',
            username: 'testuser',
            connected_at: new Date().toISOString(),
          },
        }),
      })
    })

    await page.goto('/api/auth/instagram/callback?code=test_code')
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Verify success message or account connection
    await expect(page.locator('text=Instagram connected successfully')).toBeVisible()
  })

  test('displays connected accounts', async ({ page }) => {
    // Mock connected accounts
    await page.route('**/api/social-accounts', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: 'instagram-123',
            platform: 'instagram',
            username: 'testuser',
            connected_at: '2023-01-01T00:00:00Z',
          },
          {
            id: 'tiktok-456',
            platform: 'tiktok',
            username: 'testtiktok',
            connected_at: '2023-01-02T00:00:00Z',
          },
        ]),
      })
    })

    await page.goto('/dashboard')
    await page.click('text=Social Accounts')
    
    // Verify connected accounts are displayed
    await expect(page.locator('text=testuser')).toBeVisible()
    await expect(page.locator('text=testtiktok')).toBeVisible()
  })

  test('disconnects social account', async ({ page }) => {
    // Mock disconnect API
    await page.route('**/api/social-accounts/**', (route) => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true }),
        })
      }
    })

    await page.goto('/dashboard')
    await page.click('text=Social Accounts')
    
    // Click disconnect button
    await page.click('[data-testid="disconnect-button"]:first-child')
    
    // Verify account is removed
    await expect(page.locator('[data-testid="account-card"]')).toHaveCount(1)
  })
})