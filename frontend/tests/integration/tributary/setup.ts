import { vi, beforeAll, afterAll, afterEach } from 'vitest'
import type { Address } from 'viem'

// =============================================================================
// Test Accounts (Hardhat/Foundry default accounts)
// =============================================================================

export const TEST_ACCOUNTS = {
  creator: {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as Address,
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  },
  investor: {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as Address,
    privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  },
}

// =============================================================================
// Test Contracts (using hardcoded addresses to avoid import issues)
// =============================================================================

export const TEST_CONTRACTS = {
  factory: '0xDDb711e1594A8d6a35473CDDaD611043c8711Ceb' as Address,
  marketplace: '0x2Dfc3375e79DC0fc9851F451D8cc7F94B2C5854c' as Address,
  treasury: '0x32FE11d9900D63350016374BE98ff37c3Af75847' as Address,
  usdc: '0x0000000000000000000000000000000000000000' as Address,
  testVault: '0x1234567890123456789012345678901234567890' as Address,
  testToken: '0x2345678901234567890123456789012345678901' as Address,
}

// =============================================================================
// Mock Helpers
// =============================================================================

/** Mock global fetch for Thirdweb Engine */
export function mockEngine(responses: Record<string, unknown>) {
  global.fetch = vi.fn().mockImplementation((url: string, options?: RequestInit) => {
    const urlObj = new URL(url)

    // Handle Thirdweb Engine calls
    if (url.includes('thirdweb') || url.includes('engine')) {
      const endpoint = urlObj.pathname
      const response = responses[endpoint] || { result: { queueId: 'mock-queue-123' } }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(response),
      })
    }

    // Default mock response
    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not found' }),
    })
  })
}

/** Cleanup all mocks */
export function cleanup() {
  vi.clearAllMocks()
  vi.resetModules()
}

// =============================================================================
// Global Hooks
// =============================================================================

beforeAll(() => {
  // Setup environment variables
  process.env.THIRDWEB_ENGINE_URL = 'https://mock-engine.thirdweb.com'
  process.env.THIRDWEB_SECRET_KEY = 'mock-secret-key'
  process.env.THIRDWEB_SERVER_WALLET_ADDRESS = TEST_ACCOUNTS.creator.address
})

afterEach(() => {
  cleanup()
})

afterAll(() => {
  vi.restoreAllMocks()
})
