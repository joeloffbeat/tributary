/**
 * Web3 Provider - Thirdweb Implementation
 *
 * Provides Thirdweb context to the application.
 */

'use client'

import { ThirdwebProvider } from 'thirdweb/react'
import { isThirdwebConfigured } from '@/lib/web3/thirdweb-client'

interface Web3ProviderProps {
  children: React.ReactNode
}

/**
 * Web3 Provider Component
 *
 * Wraps the application with Thirdweb context.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { Web3Provider } from '@/providers/web3-provider'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <Web3Provider>{children}</Web3Provider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export function Web3Provider({ children }: Web3ProviderProps) {
  // Warn if Thirdweb is not configured
  if (!isThirdwebConfigured()) {
    console.warn(
      '[Web3Provider] Thirdweb is not configured. ' +
      'Set NEXT_PUBLIC_THIRDWEB_CLIENT_ID in your environment.'
    )
  }

  return <ThirdwebProvider>{children}</ThirdwebProvider>
}
