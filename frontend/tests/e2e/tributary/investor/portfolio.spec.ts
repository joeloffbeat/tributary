import { test, expect } from './fixtures'

test.describe('Investor: Portfolio', () => {
  test.beforeEach(async ({ investorPage }) => {
    // Navigate to portfolio tab
    await investorPage.getByRole('tab', { name: /portfolio/i }).click()
    await expect(investorPage.getByTestId('portfolio-dashboard')).toBeVisible()
  })

  test('displays portfolio summary', async ({ investorPage }) => {
    // Summary cards visible
    await expect(investorPage.getByText(/total value/i)).toBeVisible()
    await expect(investorPage.getByText(/pending rewards/i)).toBeVisible()
    await expect(investorPage.getByText(/total claimed/i)).toBeVisible()
  })

  test('shows holdings list', async ({ investorPage }) => {
    // Holdings section visible
    await expect(investorPage.getByTestId('holdings-list')).toBeVisible()

    // Each holding shows key info
    const firstHolding = investorPage.getByTestId('holding-card').first()
    await expect(firstHolding.getByTestId('token-name')).toBeVisible()
    await expect(firstHolding.getByTestId('balance')).toBeVisible()
    await expect(firstHolding.getByTestId('pending-rewards')).toBeVisible()
  })

  test('claim individual reward', async ({ investorPage }) => {
    // Find holding with pending rewards
    const holdingWithRewards = investorPage.getByTestId('holding-card')
      .filter({ hasText: /pending/ })
      .first()

    // Click claim button
    await holdingWithRewards.getByRole('button', { name: /claim/i }).click()

    // Wait for transaction
    await expect(investorPage.getByText(/claiming/i)).toBeVisible()
    await expect(investorPage.getByText(/claimed/i)).toBeVisible({ timeout: 30000 })

    // Pending should update
    await expect(holdingWithRewards.getByTestId('pending-rewards')).toContainText('$0')
  })

  test('claim all rewards', async ({ investorPage }) => {
    // Click claim all button
    await investorPage.getByRole('button', { name: /claim all/i }).click()

    // Confirmation dialog
    await expect(investorPage.getByRole('dialog')).toBeVisible()
    await expect(investorPage.getByText(/claim all rewards/i)).toBeVisible()

    // Confirm
    await investorPage.getByRole('button', { name: /confirm/i }).click()

    // Progress indicator
    await expect(investorPage.getByTestId('claim-progress')).toBeVisible()

    // Success
    await expect(investorPage.getByText(/all rewards claimed/i)).toBeVisible({ timeout: 60000 })
  })

  test('view investment history', async ({ investorPage }) => {
    // Click history tab
    await investorPage.getByRole('tab', { name: /history/i }).click()

    // History items visible
    await expect(investorPage.getByTestId('history-item')).toHaveCount.above(0)

    // Each item shows transaction details
    const firstItem = investorPage.getByTestId('history-item').first()
    await expect(firstItem.getByTestId('tx-type')).toBeVisible()
    await expect(firstItem.getByTestId('tx-amount')).toBeVisible()
    await expect(firstItem.getByTestId('tx-date')).toBeVisible()
  })

  test('filter history by type', async ({ investorPage }) => {
    await investorPage.getByRole('tab', { name: /history/i }).click()

    // Filter by purchases
    await investorPage.getByRole('button', { name: /filter/i }).click()
    await investorPage.getByRole('menuitem', { name: /purchases/i }).click()

    // Should only show purchase transactions
    const items = investorPage.getByTestId('history-item')
    const count = await items.count()
    for (let i = 0; i < count; i++) {
      await expect(items.nth(i).getByTestId('tx-type')).toContainText(/buy/i)
    }
  })
})
