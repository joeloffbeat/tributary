import { test as base, expect, type Page } from '@playwright/test'

// Extend Playwright test with Tributary creator fixtures
export const test = base.extend<{
  creatorPage: Page
  mockWallet: MockWallet
  testVault: TestVault
}>({
  // Creator page with connected wallet
  creatorPage: async ({ page }, use) => {
    await page.goto('/tributary')
    await connectMockWallet(page)
    await use(page)
  },

  // Mock wallet for testing
  mockWallet: async ({}, use) => {
    const wallet = {
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as const,
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    }
    await use(wallet)
  },

  // Test vault data
  testVault: async ({}, use) => {
    const vault = {
      tokenName: 'Test Royalty Token',
      tokenSymbol: 'TRT',
      totalSupply: '1000000',
      creatorAllocation: 20,
      salePrice: '1000000', // $1 USDC
    }
    await use(vault)
  },
})

async function connectMockWallet(page: Page) {
  // Inject mock wallet provider
  await page.evaluate(() => {
    ;(window as any).ethereum = {
      isMetaMask: true,
      request: async ({ method }: { method: string; params?: unknown[] }) => {
        if (method === 'eth_requestAccounts') {
          return ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']
        }
        if (method === 'eth_chainId') {
          return '0x1513' // Story testnet
        }
        if (method === 'eth_accounts') {
          return ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']
        }
        return null
      },
      on: () => {},
      removeListener: () => {},
    }
  })

  // Click connect button and wait for connection
  await page.getByRole('button', { name: /connect/i }).click()
  await expect(page.getByText(/0xf39F/i)).toBeVisible({ timeout: 10000 })
}

interface MockWallet {
  address: `0x${string}`
  privateKey: string
}

interface TestVault {
  tokenName: string
  tokenSymbol: string
  totalSupply: string
  creatorAllocation: number
  salePrice: string
}

export { expect }
