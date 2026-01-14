import { test, expect } from './fixtures'
import type { Page } from '@playwright/test'

interface TestVault {
  tokenName: string
  tokenSymbol: string
  totalSupply: string
  creatorAllocation: number
  salePrice: string
}

test.describe('Creator: Create Vault', () => {
  test.beforeEach(async ({ creatorPage }) => {
    // Navigate to My Vaults tab
    await creatorPage.getByRole('tab', { name: /my vaults/i }).click()
    await expect(creatorPage.getByText(/your royalty vaults/i)).toBeVisible()
  })

  test('opens create vault dialog', async ({ creatorPage }) => {
    await creatorPage.getByRole('button', { name: /create vault/i }).click()
    await expect(creatorPage.getByRole('dialog')).toBeVisible()
    await expect(creatorPage.getByText(/step 1/i)).toBeVisible()
  })

  test('step 1: select IP asset', async ({ creatorPage }) => {
    await creatorPage.getByRole('button', { name: /create vault/i }).click()

    // Should show user's IP assets
    await expect(creatorPage.getByText(/select an ip asset/i)).toBeVisible()

    // Select first IP asset
    await creatorPage.getByTestId('ip-asset-card').first().click()

    // Next button should be enabled
    await expect(creatorPage.getByRole('button', { name: /next/i })).toBeEnabled()
    await creatorPage.getByRole('button', { name: /next/i }).click()

    // Should advance to step 2
    await expect(creatorPage.getByText(/step 2/i)).toBeVisible()
  })

  test('step 2: configure token', async ({ creatorPage, testVault }) => {
    // Navigate to step 2
    await creatorPage.getByRole('button', { name: /create vault/i }).click()
    await creatorPage.getByTestId('ip-asset-card').first().click()
    await creatorPage.getByRole('button', { name: /next/i }).click()

    // Fill token details
    await creatorPage.getByLabel(/token name/i).fill(testVault.tokenName)
    await creatorPage.getByLabel(/token symbol/i).fill(testVault.tokenSymbol)
    await creatorPage.getByLabel(/total supply/i).fill(testVault.totalSupply)
    await creatorPage
      .getByLabel(/creator allocation/i)
      .fill(String(testVault.creatorAllocation))

    // Validation should pass
    await expect(creatorPage.getByRole('button', { name: /next/i })).toBeEnabled()
    await creatorPage.getByRole('button', { name: /next/i }).click()

    await expect(creatorPage.getByText(/step 3/i)).toBeVisible()
  })

  test('step 3: configure sale', async ({ creatorPage, testVault }) => {
    // Navigate to step 3
    await navigateToStep3(creatorPage, testVault)

    // Set sale price
    await creatorPage.getByLabel(/price per token/i).fill('1')

    // Optional: set sale period
    await creatorPage.getByLabel(/sale start/i).click()
    await creatorPage.getByRole('button', { name: /today/i }).click()

    await expect(creatorPage.getByRole('button', { name: /next/i })).toBeEnabled()
    await creatorPage.getByRole('button', { name: /next/i }).click()

    await expect(creatorPage.getByText(/step 4/i)).toBeVisible()
  })

  test('step 4: review and create', async ({ creatorPage, testVault }) => {
    // Navigate to step 4
    await navigateToStep4(creatorPage, testVault)

    // Verify review shows correct info
    await expect(creatorPage.getByText(testVault.tokenName)).toBeVisible()
    await expect(creatorPage.getByText(testVault.tokenSymbol)).toBeVisible()

    // Create vault
    await creatorPage.getByRole('button', { name: /create vault/i }).click()

    // Wait for transaction
    await expect(creatorPage.getByText(/creating vault/i)).toBeVisible()
    await expect(creatorPage.getByText(/vault created/i)).toBeVisible({
      timeout: 30000,
    })
  })

  test('validates required fields', async ({ creatorPage }) => {
    await creatorPage.getByRole('button', { name: /create vault/i }).click()

    // Try to proceed without selecting IP
    await expect(creatorPage.getByRole('button', { name: /next/i })).toBeDisabled()
  })
})

// Helper functions
async function navigateToStep3(page: Page, testVault: TestVault) {
  await page.getByRole('button', { name: /create vault/i }).click()
  await page.getByTestId('ip-asset-card').first().click()
  await page.getByRole('button', { name: /next/i }).click()

  await page.getByLabel(/token name/i).fill(testVault.tokenName)
  await page.getByLabel(/token symbol/i).fill(testVault.tokenSymbol)
  await page.getByLabel(/total supply/i).fill(testVault.totalSupply)
  await page.getByLabel(/creator allocation/i).fill(String(testVault.creatorAllocation))
  await page.getByRole('button', { name: /next/i }).click()
}

async function navigateToStep4(page: Page, testVault: TestVault) {
  await navigateToStep3(page, testVault)
  await page.getByLabel(/price per token/i).fill('1')
  await page.getByRole('button', { name: /next/i }).click()
}
