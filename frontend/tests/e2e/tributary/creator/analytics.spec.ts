import { test, expect } from './fixtures'

test.describe('Creator: Analytics', () => {
  test.beforeEach(async ({ creatorPage }) => {
    await creatorPage.getByRole('tab', { name: /my vaults/i }).click()
    await creatorPage.getByTestId('vault-card').first().click()
    await creatorPage.getByRole('tab', { name: /analytics/i }).click()
  })

  test('displays analytics charts', async ({ creatorPage }) => {
    // Verify charts are rendered
    await expect(creatorPage.getByTestId('distribution-chart')).toBeVisible()
    await expect(creatorPage.getByTestId('holders-chart')).toBeVisible()
  })

  test('period selector works', async ({ creatorPage }) => {
    // Select 7d period
    await creatorPage.getByRole('button', { name: /7d/i }).click()
    await expect(creatorPage.getByRole('button', { name: /7d/i })).toHaveClass(
      /active/
    )

    // Select 30d period
    await creatorPage.getByRole('button', { name: /30d/i }).click()
    await expect(creatorPage.getByRole('button', { name: /30d/i })).toHaveClass(
      /active/
    )
  })

  test('shows key metrics', async ({ creatorPage }) => {
    await expect(creatorPage.getByText(/total yield/i)).toBeVisible()
    await expect(creatorPage.getByText(/avg holder period/i)).toBeVisible()
    await expect(creatorPage.getByText(/holder growth/i)).toBeVisible()
  })

  test('export data works', async ({ creatorPage }) => {
    // Click export button
    await creatorPage.getByRole('button', { name: /export/i }).click()

    // Verify download triggered (check for download event)
    const downloadPromise = creatorPage.waitForEvent('download')
    await creatorPage.getByRole('menuitem', { name: /csv/i }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.csv')
  })
})
