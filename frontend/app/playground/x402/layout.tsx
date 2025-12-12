/**
 * x402 Layout
 *
 * x402 uses the app's Web3 abstraction layer (currently Thirdweb).
 * For x402 payment functionality, it uses useThirdwebWallet from the abstraction layer.
 *
 * This layout is now a simple passthrough since the app uses Thirdweb globally.
 */
export default function X402Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
