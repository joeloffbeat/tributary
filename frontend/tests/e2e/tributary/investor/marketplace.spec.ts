import { test, expect } from './fixtures'

test.describe('Investor: Marketplace', () => {
  test.beforeEach(async ({ investorPage }) => {
    // Should land on marketplace tab by default
    await expect(investorPage.getByRole('tab', { name: /marketplace/i })).toHaveAttribute('aria-selected', 'true')
  })

  test('displays vault cards', async ({ investorPage }) => {
    // Wait for vaults to load
    await expect(investorPage.getByTestId('vault-card')).toHaveCount.above(0)

    // Each card shows key info
    const firstCard = investorPage.getByTestId('vault-card').first()
    await expect(firstCard.getByTestId('token-name')).toBeVisible()
    await expect(firstCard.getByTestId('floor-price')).toBeVisible()
    await expect(firstCard.getByTestId('yield')).toBeVisible()
  })

  test('filters by category', async ({ investorPage }) => {
    // Open category filter
    await investorPage.getByRole('button', { name: /category/i }).click()

    // Select a category
    await investorPage.getByRole('menuitem', { name: /music/i }).click()

    // Verify filter applied
    await expect(investorPage.getByText(/filtered by: music/i)).toBeVisible()

    // Cards should update
    await investorPage.waitForResponse(resp => resp.url().includes('/api/tributary'))
  })

  test('sorts by yield', async ({ investorPage }) => {
    // Open sort dropdown
    await investorPage.getByRole('button', { name: /sort/i }).click()

    // Select yield sort
    await investorPage.getByRole('menuitem', { name: /highest yield/i }).click()

    // Verify sort applied
    await expect(investorPage.getByRole('button', { name: /sort/i })).toContainText(/yield/i)
  })

  test('search by name', async ({ investorPage }) => {
    // Type in search
    await investorPage.getByPlaceholder(/search/i).fill('Test Token')

    // Wait for debounce and results
    await investorPage.waitForTimeout(500)
    await investorPage.waitForResponse(resp => resp.url().includes('/search'))

    // Results should be filtered
    await expect(investorPage.getByTestId('vault-card')).toHaveCount.above(0)
  })

  test('opens vault detail dialog', async ({ investorPage }) => {
    // Click on vault card
    await investorPage.getByTestId('vault-card').first().click()

    // Dialog should open
    await expect(investorPage.getByRole('dialog')).toBeVisible()
    await expect(investorPage.getByTestId('vault-detail')).toBeVisible()
  })

  test('empty state shows when no results', async ({ investorPage }) => {
    // Search for non-existent vault
    await investorPage.getByPlaceholder(/search/i).fill('xyznonexistent123')
    await investorPage.waitForTimeout(500)

    // Empty state should show
    await expect(investorPage.getByText(/no vaults found/i)).toBeVisible()
  })
})
