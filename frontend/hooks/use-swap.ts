import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useWalletClient, usePublicClient, useAccount } from '@/lib/web3'
import { parseUnits, formatUnits } from 'viem'
import { TRIBUTARY_CONTRACTS, AMM_ABI, MOCK_USDT_ABI, mantleSepolia } from '@/constants/tributary'

// Token decimals - USDT has 6, royalty tokens have 18
const USDT_DECIMALS = 6
const TOKEN_DECIMALS = 18

export interface SwapQuote {
  amountOut: string
  fee: string
  priceImpact: number
}

export function useSwapQuote(poolId: string, isBuy: boolean, amount: string) {
  const { publicClient } = usePublicClient()

  return useQuery({
    queryKey: ['swapQuote', poolId, isBuy, amount],
    queryFn: async (): Promise<SwapQuote | null> => {
      if (!publicClient || !amount || parseFloat(amount) <= 0) return null

      const contracts = TRIBUTARY_CONTRACTS[5003]
      if (!contracts) return null

      try {
        // BUY: input USDT (6 decimals), output Token (18 decimals)
        // SELL: input Token (18 decimals), output USDT (6 decimals)
        const inputDecimals = isBuy ? USDT_DECIMALS : TOKEN_DECIMALS
        const outputDecimals = isBuy ? TOKEN_DECIMALS : USDT_DECIMALS

        const amountIn = parseUnits(amount, inputDecimals)

        const result = await publicClient.readContract({
          address: contracts.amm as `0x${string}`,
          abi: AMM_ABI,
          functionName: isBuy ? 'getQuoteBuy' : 'getQuoteSell',
          args: [BigInt(poolId), amountIn],
        }) as [bigint, bigint]

        const amountOut = formatUnits(result[0], outputDecimals)
        const fee = formatUnits(result[1], USDT_DECIMALS) // Fee is always in USDT

        // Calculate price impact (simplified)
        const priceImpact = parseFloat(amount) > 1000 ? 2.5 : parseFloat(amount) > 100 ? 0.5 : 0.1

        return {
          amountOut,
          fee,
          priceImpact,
        }
      } catch (error) {
        console.error('Failed to get swap quote:', error)
        return null
      }
    },
    enabled: !!poolId && !!amount && parseFloat(amount) > 0,
    refetchInterval: 10000, // Refresh every 10s
  })
}

interface SwapParams {
  poolId: string
  isBuy: boolean
  amount: string
  minOut: string
}

export interface SwapResult {
  success: boolean
  hash?: `0x${string}`
  error?: string
}

export function useSwap() {
  const queryClient = useQueryClient()
  const { address } = useAccount()
  const { walletClient } = useWalletClient()
  const { publicClient } = usePublicClient()

  return useMutation({
    mutationFn: async (params: SwapParams): Promise<SwapResult> => {
      if (!walletClient || !publicClient || !address) {
        throw new Error('Wallet not connected')
      }

      const contracts = TRIBUTARY_CONTRACTS[5003]
      if (!contracts) {
        throw new Error('Contracts not configured for Mantle Sepolia')
      }

      // BUY: input USDT (6 decimals), output Token (18 decimals)
      // SELL: input Token (18 decimals), output USDT (6 decimals)
      const inputDecimals = params.isBuy ? USDT_DECIMALS : TOKEN_DECIMALS
      const outputDecimals = params.isBuy ? TOKEN_DECIMALS : USDT_DECIMALS

      const amountIn = parseUnits(params.amount, inputDecimals)
      const minAmountOut = parseUnits(params.minOut, outputDecimals)
      const poolIdBigInt = BigInt(params.poolId)

      // If buying, need to approve USDT first
      if (params.isBuy) {
        const allowance = await publicClient.readContract({
          address: contracts.mockUsdt as `0x${string}`,
          abi: MOCK_USDT_ABI,
          functionName: 'allowance',
          args: [address, contracts.amm],
        }) as bigint

        if (allowance < amountIn) {
          const approveHash = await walletClient.writeContract({
            chain: mantleSepolia,
            account: address,
            address: contracts.mockUsdt as `0x${string}`,
            abi: MOCK_USDT_ABI,
            functionName: 'approve',
            args: [contracts.amm as `0x${string}`, amountIn * BigInt(10)],
          })
          await publicClient.waitForTransactionReceipt({ hash: approveHash })
        }
      } else {
        // If selling, need to approve token first
        const pool = await publicClient.readContract({
          address: contracts.amm as `0x${string}`,
          abi: AMM_ABI,
          functionName: 'getPool',
          args: [poolIdBigInt],
        }) as { royaltyToken: `0x${string}` }

        const allowance = await publicClient.readContract({
          address: pool.royaltyToken,
          abi: MOCK_USDT_ABI, // ERC20 ABI works
          functionName: 'allowance',
          args: [address, contracts.amm],
        }) as bigint

        if (allowance < amountIn) {
          const approveHash = await walletClient.writeContract({
            chain: mantleSepolia,
            account: address,
            address: pool.royaltyToken,
            abi: MOCK_USDT_ABI,
            functionName: 'approve',
            args: [contracts.amm as `0x${string}`, amountIn * BigInt(10)],
          })
          await publicClient.waitForTransactionReceipt({ hash: approveHash })
        }
      }

      // Execute swap
      const hash = await walletClient.writeContract({
        chain: mantleSepolia,
        account: address,
        address: contracts.amm as `0x${string}`,
        abi: AMM_ABI,
        functionName: params.isBuy ? 'buyTokens' : 'sellTokens',
        args: [poolIdBigInt, amountIn, minAmountOut],
      })

      await publicClient.waitForTransactionReceipt({ hash })

      return { success: true, hash }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['pool'] })
      queryClient.invalidateQueries({ queryKey: ['swapQuote'] })
      queryClient.invalidateQueries({ queryKey: ['recentSwaps'] })
      queryClient.invalidateQueries({ queryKey: ['candles'] })
      queryClient.invalidateQueries({ queryKey: ['userHoldings'] })
    },
  })
}
