import { test, expect } from './fixtures'

test.describe('Creator: Manage Vault', () => {
  test.beforeEach(async ({ creatorPage }) => {
    // Navigate to vault detail
    await creatorPage.getByRole('tab', { name: /my vaults/i }).click()
    await creatorPage.getByTestId('vault-card').first().click()
    await expect(creatorPage.getByTestId('vault-detail')).toBeVisible()
  })

  test('displays vault overview', async ({ creatorPage }) => {
    // Verify key metrics shown
    await expect(creatorPage.getByText(/total distributed/i)).toBeVisible()
    await expect(creatorPage.getByText(/holder count/i)).toBeVisible()
    await expect(creatorPage.getByText(/pending distribution/i)).toBeVisible()
  })

  test('deposit royalties', async ({ creatorPage }) => {
    // Open deposit dialog
    await creatorPage.getByRole('button', { name: /deposit/i }).click()
    await expect(creatorPage.getByRole('dialog')).toBeVisible()

    // Enter amount
    await creatorPage.getByLabel(/amount/i).fill('100')

    // Deposit
    await creatorPage.getByRole('button', { name: /confirm deposit/i }).click()

    // Wait for transaction
    await expect(creatorPage.getByText(/depositing/i)).toBeVisible()
    await expect(creatorPage.getByText(/deposit successful/i)).toBeVisible({
      timeout: 30000,
    })

    // Dialog should close
    await expect(creatorPage.getByRole('dialog')).not.toBeVisible()
  })

  test('trigger distribution', async ({ creatorPage }) => {
    // Click distribute button
    await creatorPage.getByRole('button', { name: /distribute/i }).click()

    // Confirm distribution
    await expect(creatorPage.getByText(/confirm distribution/i)).toBeVisible()
    await creatorPage.getByRole('button', { name: /confirm/i }).click()

    // Wait for transaction
    await expect(creatorPage.getByText(/distributing/i)).toBeVisible()
    await expect(creatorPage.getByText(/distribution complete/i)).toBeVisible({
      timeout: 30000,
    })
  })

  test('view distribution history', async ({ creatorPage }) => {
    // Navigate to history tab
    await creatorPage.getByRole('tab', { name: /history/i }).click()

    // Verify history items shown
    const historyItems = creatorPage.getByTestId('distribution-item')
    await expect(historyItems.first()).toBeVisible()
  })

  test('view holder list', async ({ creatorPage }) => {
    // Navigate to holders tab
    await creatorPage.getByRole('tab', { name: /holders/i }).click()

    // Verify holders shown
    const holderRows = creatorPage.getByTestId('holder-row')
    await expect(holderRows.first()).toBeVisible()
  })
})
