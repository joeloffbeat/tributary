'use client'

import { useState } from 'react'
import { useAccount, useWalletClient, usePublicClient, ConnectButton } from '@/lib/web3'
import { parseUnits, formatUnits } from 'viem'
import { Droplets, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { TRIBUTARY_CONTRACTS, MOCK_USDT_ABI, mantleSepolia } from '@/constants/tributary'
import { MANTLE_SEPOLIA_CHAIN_ID } from '@/lib/config/chains'
import { useReadContract } from 'wagmi'
import Link from 'next/link'

const MINT_AMOUNT = '1000'

export default function FaucetClient() {
  const { address, isConnected, chainId } = useAccount()
  const walletClient = useWalletClient()
  const publicClient = usePublicClient()

  const [isMinting, setIsMinting] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mockUsdtAddress = TRIBUTARY_CONTRACTS[MANTLE_SEPOLIA_CHAIN_ID]?.mockUsdt

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: mockUsdtAddress,
    abi: MOCK_USDT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: MANTLE_SEPOLIA_CHAIN_ID,
  })

  const formattedBalance = balance
    ? Number(formatUnits(balance as bigint, 6)).toFixed(2)
    : '0.00'

  const isOnMantleSepolia = chainId === MANTLE_SEPOLIA_CHAIN_ID

  const handleMint = async () => {
    if (!walletClient || !publicClient || !address) return

    setIsMinting(true)
    setError(null)
    setTxHash(null)

    try {
      const amount = parseUnits(MINT_AMOUNT, 6)

      const hash = await walletClient.writeContract({
        chain: mantleSepolia,
        account: address as `0x${string}`,
        address: mockUsdtAddress,
        abi: MOCK_USDT_ABI,
        functionName: 'mint',
        args: [address, amount],
      })

      setTxHash(hash)
      await publicClient.waitForTransactionReceipt({ hash })
      await refetchBalance()
    } catch (err: any) {
      console.error('Mint failed:', err)
      setError(err.shortMessage || err.message || 'Failed to mint tokens')
    } finally {
      setIsMinting(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-6 py-24 text-center">
        <h1 className="font-title text-6xl mb-6">Faucet</h1>
        <p className="font-body text-text-secondary mb-8">
          CONNECT YOUR WALLET TO GET TEST USD
        </p>
        <ConnectButton />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-title text-5xl mb-2">Faucet</h1>
          <p className="font-body text-text-secondary">
            GET TEST USD FOR TRADING ON TRIBUTARY
          </p>
        </div>

        <div className="card-premium p-8">
          {!isOnMantleSepolia && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-body text-sm text-yellow-800">
                    PLEASE SWITCH TO MANTLE SEPOLIA
                  </p>
                  <p className="font-body text-xs text-yellow-600 mt-1">
                    The faucet is only available on Mantle Sepolia testnet.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="font-body text-xs text-text-muted mb-1">YOUR TEST USD BALANCE</p>
            <p className="font-stat text-4xl">${formattedBalance}</p>
          </div>

          <div className="mb-6 p-4 bg-cream-dark/50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-body text-sm text-text-secondary">MINT AMOUNT</span>
              <span className="font-stat text-lg">${MINT_AMOUNT}</span>
            </div>
          </div>

          <button
            onClick={handleMint}
            disabled={isMinting || !isOnMantleSepolia}
            className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMinting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                MINTING...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Droplets className="h-5 w-5" />
                MINT ${MINT_AMOUNT} TEST USD
              </span>
            )}
          </button>

          {txHash && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-body text-sm text-green-800">
                    TOKENS MINTED SUCCESSFULLY!
                  </p>
                  <a
                    href={`https://sepolia.mantlescan.xyz/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-xs text-green-600 hover:text-green-700 underline"
                  >
                    VIEW TRANSACTION →
                  </a>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-body text-sm text-red-800">
                    MINTING FAILED
                  </p>
                  <p className="font-body text-xs text-red-600 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="font-body text-xs text-text-muted">
            Test USD is used for purchasing royalty tokens on Tributary.
          </p>
          <p className="font-body text-xs text-text-muted mt-1">
            This token has no real value and is for testing purposes only.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="font-body text-sm text-tributary hover:text-tributary-light">
            ← BACK TO HOME
          </Link>
        </div>
      </div>
    </div>
  )
}
