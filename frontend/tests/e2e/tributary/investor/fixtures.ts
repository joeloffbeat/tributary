import { test as base, expect, type Page } from '@playwright/test'

// Extend Playwright test with Tributary investor fixtures
export const test = base.extend<{
  investorPage: Page
  mockInvestorWallet: MockWallet
  testPurchase: TestPurchase
}>({
  // Investor page with connected wallet
  investorPage: async ({ page }, use) => {
    await page.goto('/tributary')
    await connectMockInvestorWallet(page)
    await use(page)
  },

  // Mock investor wallet (different from creator)
  mockInvestorWallet: async ({}, use) => {
    const wallet = {
      address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
      usdcBalance: '10000000000', // 10,000 USDC
    }
    await use(wallet)
  },

  // Test purchase configuration
  testPurchase: async ({}, use) => {
    const purchase = {
      tokensToBuy: '100',
      expectedCost: '100000000', // $100 USDC
    }
    await use(purchase)
  },
})

async function connectMockInvestorWallet(page: Page) {
  // Inject mock wallet with investor address and USDC balance
  await page.evaluate(() => {
    window.ethereum = {
      isMetaMask: true,
      request: async ({ method, params }: { method: string; params?: unknown[] }) => {
        if (method === 'eth_requestAccounts') {
          return ['0x70997970C51812dc3A010C7d01b50e0d17dc79C8']
        }
        if (method === 'eth_chainId') {
          return '0x1513' // Story testnet
        }
        if (method === 'eth_call') {
          // Mock USDC balance check
          return '0x' + (10000n * 10n ** 6n).toString(16).padStart(64, '0')
        }
      },
      on: () => {},
      removeListener: () => {},
    }
  })

  await page.getByRole('button', { name: /connect/i }).click()
  await expect(page.getByText(/0x7099/i)).toBeVisible({ timeout: 10000 })
}

interface MockWallet {
  address: `0x${string}`
  usdcBalance: string
}

interface TestPurchase {
  tokensToBuy: string
  expectedCost: string
}

export { expect }
