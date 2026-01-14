import { test, expect } from './fixtures'

test.describe('Investor: Buy Tokens', () => {
  test.beforeEach(async ({ investorPage }) => {
    // Open first vault detail
    await investorPage.getByTestId('vault-card').first().click()
    await expect(investorPage.getByRole('dialog')).toBeVisible()
  })

  test('shows buy panel with price info', async ({ investorPage }) => {
    // Buy panel should be visible
    await expect(investorPage.getByTestId('buy-panel')).toBeVisible()

    // Price info displayed
    await expect(investorPage.getByText(/floor price/i)).toBeVisible()
    await expect(investorPage.getByText(/available/i)).toBeVisible()
  })

  test('calculates total cost', async ({ investorPage, testPurchase }) => {
    // Enter amount
    await investorPage.getByLabel(/amount to buy/i).fill(testPurchase.tokensToBuy)

    // Total should update
    await expect(investorPage.getByTestId('total-cost')).not.toContainText('$0')

    // Fee breakdown shown
    await expect(investorPage.getByText(/platform fee/i)).toBeVisible()
    await expect(investorPage.getByText(/creator fee/i)).toBeVisible()
  })

  test('validates insufficient balance', async ({ investorPage }) => {
    // Enter amount exceeding balance
    await investorPage.getByLabel(/amount to buy/i).fill('1000000')

    // Error should show
    await expect(investorPage.getByText(/insufficient usdc/i)).toBeVisible()

    // Buy button disabled
    await expect(investorPage.getByRole('button', { name: /buy/i })).toBeDisabled()
  })

  test('validates minimum purchase', async ({ investorPage }) => {
    // Enter very small amount
    await investorPage.getByLabel(/amount to buy/i).fill('0.001')

    // Warning should show
    await expect(investorPage.getByText(/minimum purchase/i)).toBeVisible()
  })

  test('completes purchase flow', async ({ investorPage, testPurchase }) => {
    // Enter valid amount
    await investorPage.getByLabel(/amount to buy/i).fill(testPurchase.tokensToBuy)

    // Click buy
    await investorPage.getByRole('button', { name: /buy/i }).click()

    // Approval step (if needed)
    const approvalNeeded = await investorPage.getByText(/approve usdc/i).isVisible()
    if (approvalNeeded) {
      await investorPage.getByRole('button', { name: /approve/i }).click()
      await expect(investorPage.getByText(/approving/i)).toBeVisible()
      await expect(investorPage.getByText(/approved/i)).toBeVisible({ timeout: 30000 })
    }

    // Purchase transaction
    await expect(investorPage.getByText(/purchasing/i)).toBeVisible()
    await expect(investorPage.getByText(/purchase complete/i)).toBeVisible({ timeout: 30000 })

    // Success message with details
    await expect(investorPage.getByText(/purchased/i)).toBeVisible()
    await expect(investorPage.getByText(testPurchase.tokensToBuy)).toBeVisible()
  })

  test('handles transaction rejection', async ({ investorPage, testPurchase }) => {
    // Mock wallet rejection
    await investorPage.evaluate(() => {
      window.ethereum.request = async ({ method }: { method: string }) => {
        if (method === 'eth_sendTransaction') {
          throw { code: 4001, message: 'User rejected' }
        }
      }
    })

    await investorPage.getByLabel(/amount to buy/i).fill(testPurchase.tokensToBuy)
    await investorPage.getByRole('button', { name: /buy/i }).click()

    // Error should show
    await expect(investorPage.getByText(/transaction rejected/i)).toBeVisible()

    // Can retry
    await expect(investorPage.getByRole('button', { name: /try again/i })).toBeVisible()
  })
})
