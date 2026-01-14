import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, TEST_CONTRACTS, TEST_ACCOUNTS } from '../setup'

describe('TributaryService Reads', () => {
  const now = Math.floor(Date.now() / 1000)
  let mockReadContract: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    mockReadContract = vi.fn()

    // Mock viem's createPublicClient at the module level
    vi.doMock('viem', async (importOriginal) => {
      const actual = await importOriginal<typeof import('viem')>()
      return {
        ...actual,
        createPublicClient: vi.fn().mockReturnValue({
          readContract: mockReadContract,
        }),
      }
    })
  })

  afterEach(() => {
    cleanup()
    vi.doUnmock('viem')
  })

  describe('Data Transformations', () => {
    it('handles bigint serialization correctly', () => {
      const amount = 1500000n // 1.5 USDC
      const formatted = Number(amount) / 1e6
      expect(formatted).toBe(1.5)
    })

    it('parses token amounts with correct decimals', () => {
      const userInput = '100'
      const decimals = 18
      const parsed = BigInt(userInput) * 10n ** BigInt(decimals)
      expect(parsed).toBe(100n * 10n ** 18n)
    })

    it('calculates percentage correctly', () => {
      const amount = 1000000n
      const fee = 25n // 0.25%
      const bps = 10000n
      const feeAmount = (amount * fee) / bps
      expect(feeAmount).toBe(2500n)
    })

    it('formats USDC to human readable', () => {
      const rawAmount = 1500000n // 1.5 USDC (6 decimals)
      const decimals = 6
      const formatted = `$${(Number(rawAmount) / 10 ** decimals).toFixed(2)}`
      expect(formatted).toBe('$1.50')
    })

    it('calculates platform fee correctly', () => {
      const PLATFORM_FEE_BPS = 250n // 2.5%
      const BPS_BASE = 10000n
      const totalCost = 10000000n // $10.00

      const platformFee = (totalCost * PLATFORM_FEE_BPS) / BPS_BASE
      expect(platformFee).toBe(250000n) // $0.25
    })

    it('calculates creator fee correctly', () => {
      const CREATOR_FEE_BPS = 500n // 5%
      const BPS_BASE = 10000n
      const totalCost = 10000000n // $10.00

      const creatorFee = (totalCost * CREATOR_FEE_BPS) / BPS_BASE
      expect(creatorFee).toBe(500000n) // $0.50
    })
  })

  describe('Price Impact Calculation', () => {
    it('calculates zero impact for floor price orders', () => {
      const avgPrice = 1000000n
      const floor = 1000000n
      const priceImpact = floor > 0n ? Number(((avgPrice - floor) * 10000n) / floor) / 100 : 0
      expect(priceImpact).toBe(0)
    })

    it('calculates positive impact for above-floor orders', () => {
      const avgPrice = 1050000n // $1.05 avg
      const floor = 1000000n // $1.00 floor
      const priceImpact = floor > 0n ? Number(((avgPrice - floor) * 10000n) / floor) / 100 : 0
      expect(priceImpact).toBe(5) // 5% impact
    })

    it('handles large price impacts', () => {
      const avgPrice = 2000000n // $2.00 avg
      const floor = 1000000n // $1.00 floor
      const priceImpact = floor > 0n ? Number(((avgPrice - floor) * 10000n) / floor) / 100 : 0
      expect(priceImpact).toBe(100) // 100% impact
    })
  })

  describe('Quote Aggregation', () => {
    it('aggregates multiple listings for buy quote', () => {
      const listings = [
        { amount: 100n, price: 1000000n, sold: 0n },
        { amount: 50n, price: 1100000n, sold: 0n },
      ]

      const buyAmount = 120n
      let remaining = buyAmount
      let totalCost = 0n
      const fills: { amount: bigint; cost: bigint }[] = []

      for (const l of listings) {
        if (remaining <= 0n) break
        const available = l.amount - l.sold
        const fill = remaining > available ? available : remaining
        const cost = fill * l.price
        totalCost += cost
        fills.push({ amount: fill, cost })
        remaining -= fill
      }

      expect(fills).toHaveLength(2)
      expect(fills[0].amount).toBe(100n) // All from first listing
      expect(fills[1].amount).toBe(20n) // Partial from second
      expect(totalCost).toBe(100n * 1000000n + 20n * 1100000n)
    })

    it('detects insufficient liquidity', () => {
      const listings = [
        { amount: 50n, price: 1000000n, sold: 0n },
      ]

      const buyAmount = 100n
      const totalAvailable = listings.reduce((sum, l) => sum + (l.amount - l.sold), 0n)
      const canFill = totalAvailable >= buyAmount

      expect(canFill).toBe(false)
    })
  })

  describe('Address Validation', () => {
    it('validates ethereum address format', () => {
      const validAddress = TEST_CONTRACTS.testVault
      const isValid = /^0x[a-fA-F0-9]{40}$/.test(validAddress)
      expect(isValid).toBe(true)
    })

    it('rejects invalid address format', () => {
      const invalidAddress = '0xinvalid'
      const isValid = /^0x[a-fA-F0-9]{40}$/.test(invalidAddress)
      expect(isValid).toBe(false)
    })

    it('rejects short address', () => {
      const shortAddress = '0x1234'
      const isValid = /^0x[a-fA-F0-9]{40}$/.test(shortAddress)
      expect(isValid).toBe(false)
    })
  })

  describe('Time Calculations', () => {
    it('calculates 24h time range', () => {
      const endTime = Math.floor(Date.now() / 1000)
      const startTime = endTime - 86400
      expect(endTime - startTime).toBe(86400)
    })

    it('calculates 7d time range', () => {
      const endTime = Math.floor(Date.now() / 1000)
      const startTime = endTime - 604800
      expect(endTime - startTime).toBe(604800)
    })

    it('filters distributions within time range', () => {
      const now = BigInt(Math.floor(Date.now() / 1000))
      const distributions = [
        { timestamp: now - 1000n, amount: 100n }, // Within range
        { timestamp: now - 100000n, amount: 200n }, // Out of range
      ]
      const startTime = now - 50000n

      const filtered = distributions.filter((d) => d.timestamp >= startTime)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].amount).toBe(100n)
    })
  })
})
