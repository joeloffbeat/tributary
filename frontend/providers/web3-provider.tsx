/**
 * Web3 Provider - Privy Implementation
 *
 * Provides Privy + wagmi context to the application with QueryClient.
 */

'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider, createConfig } from '@privy-io/wagmi'
import { http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getSupportedViemChains, getChainTransports, getDefaultChain } from '@/lib/config/chains'
import type { Chain } from 'viem'

// Create chains and transports
const chains = getSupportedViemChains() as [Chain, ...Chain[]]
const transportsConfig = getChainTransports()

// Create wagmi config
const wagmiConfig = createConfig({
  chains,
  transports: Object.fromEntries(
    chains.map((chain) => [chain.id, http(transportsConfig[chain.id])])
  ),
})

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    },
  },
})

interface Web3ProviderProps {
  children: React.ReactNode
}

/**
 * Web3 Provider Component
 *
 * Wraps the application with Privy + wagmi context.
 */
export function Web3Provider({ children }: Web3ProviderProps) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

  if (!privyAppId) {
    console.warn(
      '[Web3Provider] NEXT_PUBLIC_PRIVY_APP_ID is not set. ' +
        'Get your app ID from https://dashboard.privy.io'
    )
    // Return children with just QueryClient for non-wallet queries
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  const defaultChain = getDefaultChain()

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#000000',
          logo: process.env.NEXT_PUBLIC_APP_ICON || '/logo.png',
        },
        loginMethods: ['email', 'wallet'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        defaultChain: defaultChain.chain,
        supportedChains: chains,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}

// Export wagmi config for use in other parts of the app
export { wagmiConfig }
