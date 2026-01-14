import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { cleanup, TEST_ACCOUNTS, TEST_CONTRACTS, mockEngine } from '../setup'

describe('Vault API Routes', () => {
  const now = Math.floor(Date.now() / 1000)

  // Route handlers - dynamically imported
  let POST: (req: NextRequest) => Promise<Response>
  let GET: (req: NextRequest) => Promise<Response>

  // Mock functions
  let mockGetVaultsByCreator: ReturnType<typeof vi.fn>
  let mockGetVaultByIPId: ReturnType<typeof vi.fn>
  let mockGetVaultRecord: ReturnType<typeof vi.fn>
  let mockGetVaultInfo: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.resetModules()

    // Create mock functions
    mockGetVaultsByCreator = vi.fn()
    mockGetVaultByIPId = vi.fn()
    mockGetVaultRecord = vi.fn()
    mockGetVaultInfo = vi.fn()

    // Mock the reads module
    vi.doMock('@/lib/services/tributary/reads', () => ({
      getVaultsByCreator: mockGetVaultsByCreator,
      getVaultByIPId: mockGetVaultByIPId,
      getVaultRecord: mockGetVaultRecord,
      getVaultInfo: mockGetVaultInfo,
    }))

    // Import route handlers after mocking
    const vaultModule = await import('@/app/api/tributary/vault/route')
    POST = vaultModule.POST
    GET = vaultModule.GET

    // Mock Thirdweb Engine
    mockEngine({
      '/write': { result: { queueId: 'test-queue-123' } },
    })

    // Setup default mock responses
    mockGetVaultRecord.mockImplementation(async () => ({
      vault: TEST_CONTRACTS.testVault,
      token: TEST_CONTRACTS.testToken,
      creator: TEST_ACCOUNTS.creator.address,
      storyIPId: '0x1234567890123456789012345678901234567890123456789012345678901234' as `0x${string}`,
      createdAt: BigInt(now),
      isActive: true,
    }))

    mockGetVaultInfo.mockImplementation(async () => ({
      storyIPId: '0x1234567890123456789012345678901234567890123456789012345678901234' as `0x${string}`,
      creator: TEST_ACCOUNTS.creator.address,
      royaltyToken: TEST_CONTRACTS.testToken,
      paymentToken: TEST_CONTRACTS.usdc,
      totalDeposited: 1000000n,
      totalDistributed: 500000n,
      pendingDistribution: 100000n,
      lastDistributionTime: BigInt(now),
      isActive: true,
    }))
  })

  afterEach(() => {
    cleanup()
    vi.doUnmock('@/lib/services/tributary/reads')
  })

  describe('POST /api/tributary/vault', () => {
    it('creates vault with valid parameters', async () => {
      const request = new NextRequest('http://localhost/api/tributary/vault', {
        method: 'POST',
        body: JSON.stringify({
          storyIPId: '0x1234567890123456789012345678901234567890',
          creator: TEST_ACCOUNTS.creator.address,
          tokenName: 'Test Royalty Token',
          tokenSymbol: 'TRT',
          totalSupply: '1000000000000000000000000',
          creatorAllocation: '20',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.queueId).toBeDefined()
      expect(data.vault.tokenName).toBe('Test Royalty Token')
    })

    it('rejects missing required fields', async () => {
      const request = new NextRequest('http://localhost/api/tributary/vault', {
        method: 'POST',
        body: JSON.stringify({
          storyIPId: '0x1234567890123456789012345678901234567890',
          // Missing creator, tokenName, tokenSymbol
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Missing required fields')
    })

    it('rejects invalid allocation percentage over 100', async () => {
      const request = new NextRequest('http://localhost/api/tributary/vault', {
        method: 'POST',
        body: JSON.stringify({
          storyIPId: '0x1234567890123456789012345678901234567890',
          creator: TEST_ACCOUNTS.creator.address,
          tokenName: 'Test',
          tokenSymbol: 'TST',
          totalSupply: '1000000',
          creatorAllocation: '150', // Invalid: > 100
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('allocation')
    })

    it('rejects zero total supply', async () => {
      const request = new NextRequest('http://localhost/api/tributary/vault', {
        method: 'POST',
        body: JSON.stringify({
          storyIPId: '0x1234567890123456789012345678901234567890',
          creator: TEST_ACCOUNTS.creator.address,
          tokenName: 'Test',
          tokenSymbol: 'TST',
          totalSupply: '0',
          creatorAllocation: '20',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Total supply')
    })
  })

  describe('GET /api/tributary/vault', () => {
    it('fetches vault by address', async () => {
      const request = new NextRequest(
        `http://localhost/api/tributary/vault?address=${TEST_CONTRACTS.testVault}`
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.vault).toBeDefined()
      expect(data.vault.vault).toBe(TEST_CONTRACTS.testVault)
    })

    it('fetches vaults by creator', async () => {
      mockGetVaultsByCreator.mockResolvedValue([TEST_CONTRACTS.testVault])

      const request = new NextRequest(
        `http://localhost/api/tributary/vault?creator=${TEST_ACCOUNTS.creator.address}`
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.vaults).toBeDefined()
      expect(data.vaults).toHaveLength(1)
    })

    it('fetches vault by IP ID', async () => {
      const ipId = '0x1234567890123456789012345678901234567890'
      mockGetVaultByIPId.mockResolvedValue(TEST_CONTRACTS.testVault)

      const request = new NextRequest(
        `http://localhost/api/tributary/vault?ipId=${ipId}`
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.vault).toBeDefined()
    })

    it('returns 404 for non-existent vault by IP ID', async () => {
      mockGetVaultByIPId.mockResolvedValue(
        '0x0000000000000000000000000000000000000000'
      )

      const request = new NextRequest(
        'http://localhost/api/tributary/vault?ipId=0x0000000000000000000000000000000000000000'
      )

      const response = await GET(request)
      expect(response.status).toBe(404)
    })

    it('returns 400 when no query parameters provided', async () => {
      const request = new NextRequest('http://localhost/api/tributary/vault')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Must provide')
    })
  })
})
