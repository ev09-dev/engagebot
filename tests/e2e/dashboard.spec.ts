import { test, expect } from '@playwright/test'

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

  // Mock comments API
  await page.route('**/api/comments', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify([
        {
          id: 'comment-1',
          content: 'Great post!',
          author_username: 'fan1',
          platform: 'instagram',
          relevance_score: 0.9,
          is_spam: false,
        },
        {
          id: 'comment-2',
          content: 'Love this content',
          author_username: 'fan2',
          platform: 'tiktok',
          relevance_score: 0.8,
          is_spam: false,
        },
      ]),
    })
  })
})

test.describe('Dashboard', () => {
  test('loads dashboard page', async ({ page }) => {
    await page.goto('/dashboard')
    
    await expect(page).toHaveTitle(/EngageBot/)
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('displays comments in the feed', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for comments to load
    await expect(page.locator('[data-testid="comment-card"]')).toHaveCount(2)
    
    // Check first comment
    const firstComment = page.locator('[data-testid="comment-card"]').first()
    await expect(firstComment).toContainText('Great post!')
    await expect(firstComment).toContainText('@fan1')
  })

  test('switches between tabs', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Click on Analytics tab
    await page.click('text=Analytics')
    await expect(page.locator('h2')).toContainText('Analytics')
    
    // Click on Accounts tab
    await page.click('text=Social Accounts')
    await expect(page.locator('h2')).toContainText('Social Accounts')
    
    // Click on Tone tab
    await page.click('text=Voice Tone')
    await expect(page.locator('h2')).toContainText('Voice Tone')
    
    // Click on Automation tab
    await page.click('text=Automation')
    await expect(page.locator('h2')).toContainText('Automation')
  })

  test('generates AI response for comment', async ({ page }) => {
    // Mock AI response
    await page.route('**/api/ai/generate-response', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          response: 'Thank you so much for your kind words!',
        }),
      })
    })

    await page.goto('/dashboard')
    
    // Click generate response button on first comment
    await page.click('[data-testid="generate-response-button"]:first-child')
    
    // Wait for response to appear
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible()
    await expect(page.locator('[data-testid="ai-response"]')).toContainText('Thank you so much')
  })

  test('marks comment as spam', async ({ page }) => {
    // Mock spam API
    await page.route('**/api/comments/spam', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true }),
      })
    })

    await page.goto('/dashboard')
    
    // Click mark as spam button
    await page.click('[data-testid="mark-spam-button"]:first-child')
    
    // Verify comment is hidden or marked
    await expect(page.locator('[data-testid="comment-card"]')).toHaveCount(1)
  })
})