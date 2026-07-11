import { test, expect } from '@playwright/test'

test.describe('Subscription Management', () => {
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

    // Mock user subscription
    await page.route('**/api/subscription', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          tier: 'free',
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      })
    })
  })

  test('displays subscription plans', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Navigate to Analytics tab (where subscription manager is located)
    await page.click('text=Analytics')
    
    // Verify subscription plans are displayed
    await expect(page.locator('text=Free')).toBeVisible()
    await expect(page.locator('text=Pro')).toBeVisible()
    await expect(page.locator('text=Enterprise')).toBeVisible()
  })

  test('initiates Stripe checkout', async ({ page }) => {
    // Mock Stripe checkout session
    await page.route('**/api/stripe/checkout', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          sessionId: 'cs_test_123',
          url: 'https://checkout.stripe.com/pay/cs_test_123',
        }),
      })
    })

    await page.goto('/dashboard')
    await page.click('text=Analytics')
    
    // Select Pro plan
    await page.click('[data-testid="plan-pro"]')
    
    // Click checkout button
    await page.click('text=Upgrade to Pro')
    
    // Verify redirect to Stripe checkout
    await expect(page).toHaveURL(/stripe\.com/)
  })

  test('handles successful subscription', async ({ page }) => {
    // Mock successful webhook
    await page.route('**/api/stripe/webhook', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ received: true }),
      })
    })

    // Mock updated subscription
    await page.route('**/api/subscription', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          tier: 'pro',
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      })
    })

    await page.goto('/dashboard?success=true')
    await page.click('text=Analytics')
    
    // Verify success message
    await expect(page.locator('text=Subscription upgraded successfully')).toBeVisible()
    
    // Verify plan is updated
    await expect(page.locator('[data-testid="current-plan"]')).toContainText('Pro')
  })

  test('displays usage limits based on subscription', async ({ page }) => {
    // Mock usage data
    await page.route('**/api/usage', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          comments_replied: 25,
          comments_limit: 50,
          suggestions_used: 10,
          suggestions_limit: 50,
        }),
      })
    })

    await page.goto('/dashboard')
    await page.click('text=Analytics')
    
    // Verify usage display
    await expect(page.locator('text=25 / 50 comments')).toBeVisible()
    await expect(page.locator('text=10 / 50 suggestions')).toBeVisible()
  })

  test('shows upgrade prompt when approaching limits', async ({ page }) => {
    // Mock usage near limit
    await page.route('**/api/usage', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          comments_replied: 45,
          comments_limit: 50,
          suggestions_used: 40,
          suggestions_limit: 50,
        }),
      })
    })

    await page.goto('/dashboard')
    await page.click('text=Analytics')
    
    // Verify upgrade prompt
    await expect(page.locator('text=You are approaching your limit')).toBeVisible()
    await expect(page.locator('text=Upgrade to Pro')).toBeVisible()
  })
})