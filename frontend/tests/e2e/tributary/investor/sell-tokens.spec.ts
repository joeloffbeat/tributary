import { test, expect } from './fixtures'

test.describe('Investor: Sell Tokens', () => {
  test.beforeEach(async ({ investorPage }) => {
    // Navigate to portfolio and open holding detail
    await investorPage.getByRole('tab', { name: /portfolio/i }).click()
    await investorPage.getByTestId('holding-card').first().click()
    await expect(investorPage.getByRole('dialog')).toBeVisible()
  })

  test('opens sell dialog', async ({ investorPage }) => {
    await investorPage.getByRole('button', { name: /sell/i }).click()
    await expect(investorPage.getByText(/sell tokens/i)).toBeVisible()
  })

  test('shows max sellable amount', async ({ investorPage }) => {
    await investorPage.getByRole('button', { name: /sell/i }).click()

    // Max button visible
    await expect(investorPage.getByRole('button', { name: /max/i })).toBeVisible()

    // Click max
    await investorPage.getByRole('button', { name: /max/i }).click()

    // Amount should be filled
    const amountInput = investorPage.getByLabel(/amount to sell/i)
    await expect(amountInput).not.toHaveValue('0')
  })

  test('calculates proceeds after fees', async ({ investorPage }) => {
    await investorPage.getByRole('button', { name: /sell/i }).click()
    await investorPage.getByLabel(/amount to sell/i).fill('10')

    // Proceeds shown
    await expect(investorPage.getByText(/you will receive/i)).toBeVisible()
    await expect(investorPage.getByTestId('net-proceeds')).not.toContainText('$0')
  })

  test('creates listing', async ({ investorPage }) => {
    await investorPage.getByRole('button', { name: /sell/i }).click()
    await investorPage.getByLabel(/amount to sell/i).fill('10')
    await investorPage.getByLabel(/price per token/i).fill('1.5')

    await investorPage.getByRole('button', { name: /create listing/i }).click()

    // Wait for transaction
    await expect(investorPage.getByText(/creating listing/i)).toBeVisible()
    await expect(investorPage.getByText(/listing created/i)).toBeVisible({ timeout: 30000 })
  })
})
