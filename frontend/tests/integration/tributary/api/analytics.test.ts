import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { cleanup, TEST_CONTRACTS, TEST_ACCOUNTS } from '../setup'

describe('Analytics API Routes', () => {
  // Route handlers - dynamically imported to reset cache
  let getPlatformStats: (req: NextRequest) => Promise<Response>
  let getVaultAnalytics: (
    req: NextRequest,
    ctx: { params: Promise<{ address: string }> }
  ) => Promise<Response>

  // Mock functions
  let mockGetAllVaults: ReturnType<typeof vi.fn>
  let mockGetVaultInfo: ReturnType<typeof vi.fn>
  let mockGetVaultRecord: ReturnType<typeof vi.fn>
  let mockGetDistribution: ReturnType<typeof vi.fn>
  let mockIsValidVault: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    // Reset all modules to get fresh cache state
    vi.resetModules()

    // Create mock functions
    mockGetAllVaults = vi.fn()
    mockGetVaultInfo = vi.fn()
    mockGetVaultRecord = vi.fn()
    mockGetDistribution = vi.fn()
    mockIsValidVault = vi.fn()

    // Mock the reads module
    vi.doMock('@/lib/services/tributary/reads', () => ({
      getAllVaults: mockGetAllVaults,
      getVaultInfo: mockGetVaultInfo,
      getVaultRecord: mockGetVaultRecord,
      getDistribution: mockGetDistribution,
      isValidVault: mockIsValidVault,
    }))

    // Import route handlers after mocking
    const platformModule = await import('@/app/api/tributary/analytics/platform/route')
    const vaultModule = await import('@/app/api/tributary/analytics/vault/[address]/route')
    getPlatformStats = platformModule.GET
    getVaultAnalytics = vaultModule.GET

    // Setup default mock responses
    mockGetAllVaults.mockResolvedValue([
      {
        vault: TEST_CONTRACTS.testVault,
        token: TEST_CONTRACTS.testToken,
        creator: TEST_ACCOUNTS.creator.address,
        storyIPId: '0x1234' as `0x${string}`,
        createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400),
        isActive: true,
      },
      {
        vault: '0x3456789012345678901234567890123456789012' as `0x${string}`,
        token: '0x4567890123456789012345678901234567890123' as `0x${string}`,
        creator: TEST_ACCOUNTS.investor.address,
        storyIPId: '0x5678' as `0x${string}`,
        createdAt: BigInt(Math.floor(Date.now() / 1000)),
        isActive: true,
      },
    ])

    mockGetVaultInfo.mockResolvedValue({
      storyIPId: '0x1234' as `0x${string}`,
      creator: TEST_ACCOUNTS.creator.address,
      royaltyToken: TEST_CONTRACTS.testToken,
      paymentToken: TEST_CONTRACTS.usdc,
      totalDeposited: 5000000000n,
      totalDistributed: 1000000000n,
      pendingDistribution: 500000n,
      lastDistributionTime: BigInt(Math.floor(Date.now() / 1000)),
      isActive: true,
    })

    mockGetVaultRecord.mockResolvedValue({
      vault: TEST_CONTRACTS.testVault,
      token: TEST_CONTRACTS.testToken,
      creator: TEST_ACCOUNTS.creator.address,
      storyIPId: '0x1234' as `0x${string}`,
      createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400),
      isActive: true,
    })

    mockIsValidVault.mockResolvedValue(true)

    mockGetDistribution.mockImplementation(async (_: unknown, id: bigint) => {
      if (id < 2n) {
        return {
          snapshotId: id,
          amount: 500000000n,
          timestamp: BigInt(Math.floor(Date.now() / 1000) - Number(id) * 86400),
          totalClaimed: 400000000n,
        }
      }
      throw new Error('Distribution not found')
    })
  })

  afterEach(() => {
    cleanup()
    vi.doUnmock('@/lib/services/tributary/reads')
  })

  describe('GET /api/tributary/analytics/platform', () => {
    it('returns platform statistics', async () => {
      const request = new NextRequest('http://localhost/api/tributary/analytics/platform')
      const response = await getPlatformStats(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.stats).toBeDefined()
      expect(data.stats.totalVaults).toBe(2)
      expect(data.stats.activeVaults).toBe(2)
      expect(data.stats.totalCreators).toBe(2)
    })

    it('returns fresh data on first request', async () => {
      const request = new NextRequest('http://localhost/api/tributary/analytics/platform')
      const response = await getPlatformStats(request)
      const data = await response.json()

      expect(data.cached).toBe(false)
    })

    it('caches results for subsequent requests', async () => {
      // First request - should not be cached
      const request1 = new NextRequest('http://localhost/api/tributary/analytics/platform')
      await getPlatformStats(request1)

      // Second request - should use cache
      const request2 = new NextRequest('http://localhost/api/tributary/analytics/platform')
      const response2 = await getPlatformStats(request2)
      const data2 = await response2.json()

      expect(data2.cached).toBe(true)
    })

    it('bypasses cache with refresh parameter', async () => {
      // Prime the cache
      await getPlatformStats(new NextRequest('http://localhost/api/tributary/analytics/platform'))

      // Request with refresh=true
      const request = new NextRequest('http://localhost/api/tributary/analytics/platform?refresh=true')
      const response = await getPlatformStats(request)
      const data = await response.json()

      expect(data.cached).toBe(false)
    })
  })

  describe('GET /api/tributary/analytics/vault/[address]', () => {
    it('returns vault analytics with distribution history', async () => {
      const request = new NextRequest(
        `http://localhost/api/tributary/analytics/vault/${TEST_CONTRACTS.testVault}`
      )
      const response = await getVaultAnalytics(request, {
        params: Promise.resolve({ address: TEST_CONTRACTS.testVault }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.analytics).toBeDefined()
      expect(data.analytics.vault).toBe(TEST_CONTRACTS.testVault)
      expect(data.analytics.distributionHistory).toBeDefined()
      expect(Array.isArray(data.analytics.distributionHistory)).toBe(true)
    })

    it('respects period parameter', async () => {
      const request = new NextRequest(
        `http://localhost/api/tributary/analytics/vault/${TEST_CONTRACTS.testVault}?period=7d`
      )
      const response = await getVaultAnalytics(request, {
        params: Promise.resolve({ address: TEST_CONTRACTS.testVault }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.analytics).toBeDefined()
    })

    it('returns 400 for invalid vault address', async () => {
      const request = new NextRequest(
        'http://localhost/api/tributary/analytics/vault/invalid-address'
      )
      const response = await getVaultAnalytics(request, {
        params: Promise.resolve({ address: 'invalid-address' }),
      })

      expect(response.status).toBe(400)
    })

    it('returns 404 for non-existent vault', async () => {
      mockIsValidVault.mockResolvedValue(false)

      const request = new NextRequest(
        `http://localhost/api/tributary/analytics/vault/${TEST_CONTRACTS.testVault}`
      )
      const response = await getVaultAnalytics(request, {
        params: Promise.resolve({ address: TEST_CONTRACTS.testVault }),
      })

      expect(response.status).toBe(404)
    })
  })
})
