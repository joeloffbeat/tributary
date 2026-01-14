import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { cleanup, TEST_CONTRACTS, TEST_ACCOUNTS } from '../setup'
import type { Listing } from '@/lib/services/tributary-types'

describe('Price API Routes', () => {
  const now = BigInt(Math.floor(Date.now() / 1000))

  // Route handlers - dynamically imported
  let getPrice: (
    req: NextRequest,
    ctx: { params: Promise<{ tokenAddress: string }> }
  ) => Promise<Response>
  let getBuyQuote: (req: NextRequest) => Promise<Response>

  // Mock functions
  let mockGetFloorPrice: ReturnType<typeof vi.fn>
  let mockGetListingsByToken: ReturnType<typeof vi.fn>

  const mockListings: Listing[] = [
    {
      listingId: 1n,
      seller: TEST_ACCOUNTS.creator.address,
      royaltyToken: TEST_CONTRACTS.testToken,
      vault: TEST_CONTRACTS.testVault,
      amount: 100000000000n, // 100 tokens
      pricePerToken: 1000000n, // $1.00
      paymentToken: TEST_CONTRACTS.usdc,
      sold: 0n,
      isActive: true,
      isPrimarySale: true,
      createdAt: now - 3600n,
      expiresAt: now + 86400n,
    },
    {
      listingId: 2n,
      seller: TEST_ACCOUNTS.investor.address,
      royaltyToken: TEST_CONTRACTS.testToken,
      vault: TEST_CONTRACTS.testVault,
      amount: 50000000000n, // 50 tokens
      pricePerToken: 1100000n, // $1.10
      paymentToken: TEST_CONTRACTS.usdc,
      sold: 0n,
      isActive: true,
      isPrimarySale: false,
      createdAt: now - 1800n,
      expiresAt: now + 86400n,
    },
  ]

  beforeEach(async () => {
    vi.resetModules()

    // Create mock functions
    mockGetFloorPrice = vi.fn()
    mockGetListingsByToken = vi.fn()

    // Mock the reads module
    vi.doMock('@/lib/services/tributary/reads', () => ({
      getFloorPrice: mockGetFloorPrice,
      getListingsByToken: mockGetListingsByToken,
    }))

    // Import route handlers after mocking
    const priceModule = await import('@/app/api/tributary/price/[tokenAddress]/route')
    const quoteModule = await import('@/app/api/tributary/quote/buy/route')
    getPrice = priceModule.GET
    getBuyQuote = quoteModule.POST

    // Setup default mocks
    mockGetFloorPrice.mockResolvedValue(1000000n)
    mockGetListingsByToken.mockResolvedValue(mockListings)
  })

  afterEach(() => {
    cleanup()
    vi.doUnmock('@/lib/services/tributary/reads')
  })

  describe('GET /api/tributary/price/[tokenAddress]', () => {
    it('returns current price data', async () => {
      const request = new NextRequest(
        `http://localhost/api/tributary/price/${TEST_CONTRACTS.testToken}`
      )
      const response = await getPrice(request, {
        params: Promise.resolve({ tokenAddress: TEST_CONTRACTS.testToken }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.price).toBeDefined()
      expect(data.price.floorPrice).toBe('1000000')
      expect(data.price.totalListings).toBe(2)
    })

    it('calculates volume from sold listings', async () => {
      const soldListings: Listing[] = [
        {
          ...mockListings[0],
          sold: 50000000000n, // Sold 50 tokens
          createdAt: now - 3600n, // Within 24h
        },
      ]
      mockGetListingsByToken.mockResolvedValue(soldListings)

      const request = new NextRequest(
        `http://localhost/api/tributary/price/${TEST_CONTRACTS.testToken}`
      )
      const response = await getPrice(request, {
        params: Promise.resolve({ tokenAddress: TEST_CONTRACTS.testToken }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(BigInt(data.price.volume24h)).toBeGreaterThan(0n)
    })

    it('returns 404 for unknown token', async () => {
      mockGetFloorPrice.mockRejectedValue(new Error('Not found'))
      mockGetListingsByToken.mockRejectedValue(new Error('Not found'))

      const request = new NextRequest(
        'http://localhost/api/tributary/price/0x0000000000000000000000000000000000000000'
      )
      const response = await getPrice(request, {
        params: Promise.resolve({ tokenAddress: '0x0000000000000000000000000000000000000000' }),
      })

      expect(response.status).toBe(404)
    })

    it('returns 400 for invalid address format', async () => {
      const request = new NextRequest(
        'http://localhost/api/tributary/price/invalid'
      )
      const response = await getPrice(request, {
        params: Promise.resolve({ tokenAddress: 'invalid' }),
      })

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/tributary/quote/buy', () => {
    it('calculates buy quote with fees', async () => {
      const request = new NextRequest('http://localhost/api/tributary/quote/buy', {
        method: 'POST',
        body: JSON.stringify({
          tokenAddress: TEST_CONTRACTS.testToken,
          amount: '10000000000', // 10 tokens
          buyer: TEST_ACCOUNTS.investor.address,
        }),
      })

      const response = await getBuyQuote(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.quote).toBeDefined()
      expect(data.quote.canFill).toBe(true)
      expect(data.quote.platformFee).toBeDefined()
      expect(data.quote.creatorFee).toBeDefined()
      expect(BigInt(data.quote.totalWithFees)).toBeGreaterThan(BigInt(data.quote.totalCost))
    })

    it('fills from multiple listings for large orders', async () => {
      const request = new NextRequest('http://localhost/api/tributary/quote/buy', {
        method: 'POST',
        body: JSON.stringify({
          tokenAddress: TEST_CONTRACTS.testToken,
          amount: '120000000000', // 120 tokens - requires both listings
          buyer: TEST_ACCOUNTS.investor.address,
        }),
      })

      const response = await getBuyQuote(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.quote.canFill).toBe(true)
      expect(data.quote.listingsToFill.length).toBeGreaterThan(1)
    })

    it('returns error for insufficient liquidity', async () => {
      mockGetListingsByToken.mockResolvedValue([])

      const request = new NextRequest('http://localhost/api/tributary/quote/buy', {
        method: 'POST',
        body: JSON.stringify({
          tokenAddress: TEST_CONTRACTS.testToken,
          amount: '1000000000000', // Very large amount
          buyer: TEST_ACCOUNTS.investor.address,
        }),
      })

      const response = await getBuyQuote(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Insufficient liquidity')
    })

    it('calculates price impact for large orders', async () => {
      const request = new NextRequest('http://localhost/api/tributary/quote/buy', {
        method: 'POST',
        body: JSON.stringify({
          tokenAddress: TEST_CONTRACTS.testToken,
          amount: '120000000000', // Requires multiple listings at different prices
          buyer: TEST_ACCOUNTS.investor.address,
        }),
      })

      const response = await getBuyQuote(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.quote.priceImpact).toBeGreaterThan(0)
    })

    it('returns 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost/api/tributary/quote/buy', {
        method: 'POST',
        body: JSON.stringify({
          tokenAddress: TEST_CONTRACTS.testToken,
          // Missing amount and buyer
        }),
      })

      const response = await getBuyQuote(request)
      expect(response.status).toBe(400)
    })

    it('returns 400 for zero amount', async () => {
      const request = new NextRequest('http://localhost/api/tributary/quote/buy', {
        method: 'POST',
        body: JSON.stringify({
          tokenAddress: TEST_CONTRACTS.testToken,
          amount: '0',
          buyer: TEST_ACCOUNTS.investor.address,
        }),
      })

      const response = await getBuyQuote(request)
      expect(response.status).toBe(400)
    })
  })
})
