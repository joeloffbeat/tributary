/**
 * Thirdweb Client Configuration
 *
 * Creates and exports the Thirdweb client instance used across the app.
 * Also provides hooks to access the client and raw Thirdweb wallet/account.
 */

import { createThirdwebClient, ThirdwebClient } from 'thirdweb'
import { useActiveWallet, useActiveAccount } from 'thirdweb/react'
import type { Wallet } from 'thirdweb/wallets'
import type { Account } from 'thirdweb/wallets'

// =============================================================================
// Client Creation
// =============================================================================

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID

if (!clientId) {
  console.warn(
    '[Thirdweb] NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set. ' +
    'Get your client ID from https://thirdweb.com/dashboard'
  )
}

/**
 * Thirdweb client instance
 * Will be undefined if client ID is not configured
 */
export const thirdwebClient: ThirdwebClient | undefined = clientId
  ? createThirdwebClient({ clientId })
  : undefined

/**
 * Get the Thirdweb client, throws if not configured
 */
export function getThirdwebClient(): ThirdwebClient {
  if (!thirdwebClient) {
    throw new Error(
      'Thirdweb client not configured. Set NEXT_PUBLIC_THIRDWEB_CLIENT_ID in your environment.'
    )
  }
  return thirdwebClient
}

/**
 * Check if Thirdweb is properly configured
 */
export function isThirdwebConfigured(): boolean {
  return !!thirdwebClient
}

// =============================================================================
// Raw Thirdweb Hooks (for x402 and other Thirdweb-specific features)
// =============================================================================

/**
 * Get the raw Thirdweb wallet object
 * Use this for Thirdweb-specific features like wrapFetchWithPayment
 */
export function useThirdwebWallet(): Wallet | undefined {
  return useActiveWallet()
}

/**
 * Get the raw Thirdweb account object
 * Use this for Thirdweb-specific features
 */
export function useThirdwebAccount(): Account | undefined {
  return useActiveAccount()
}

// =============================================================================
// Type Exports
// =============================================================================

export type { ThirdwebClient, Wallet, Account }
