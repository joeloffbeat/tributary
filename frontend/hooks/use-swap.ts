import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useWalletClient, usePublicClient, useAccount } from '@/lib/web3'
import { parseUnits, formatUnits } from 'viem'
import { TRIBUTARY_CONTRACTS, AMM_ABI, MOCK_USDT_ABI, mantleSepolia } from '@/constants/tributary'

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
        // Get quote from AMM contract
        const amountIn = parseUnits(amount, 18)

        const result = await publicClient.readContract({
          address: contracts.amm as `0x${string}`,
          abi: AMM_ABI,
          functionName: isBuy ? 'getQuoteBuy' : 'getQuoteSell',
          args: [BigInt(poolId), amountIn],
        }) as [bigint, bigint]

        const amountOut = formatUnits(result[0], 18)
        const fee = formatUnits(result[1], 18)

        // Calculate price impact (simplified)
        const priceImpact = parseFloat(amount) > 1000 ? 2.5 : parseFloat(amount) > 100 ? 0.5 : 0.1

        return {
          amountOut,
          fee,
          priceImpact,
        }
      } catch (error) {
        console.error('Failed to get swap quote:', error)
        // Return mock quote for demo
        const mockOut = parseFloat(amount) * (isBuy ? 1 : 1.2)
        return {
          amountOut: mockOut.toFixed(4),
          fee: (parseFloat(amount) * 0.01).toFixed(4),
          priceImpact: 0.5,
        }
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

export function useSwap() {
  const queryClient = useQueryClient()
  const { address } = useAccount()
  const { walletClient } = useWalletClient()
  const { publicClient } = usePublicClient()

  return useMutation({
    mutationFn: async (params: SwapParams) => {
      if (!walletClient || !publicClient || !address) {
        throw new Error('Wallet not connected')
      }

      const contracts = TRIBUTARY_CONTRACTS[5003]
      if (!contracts) {
        throw new Error('Contracts not configured')
      }

      const amountIn = parseUnits(params.amount, 18)
      const minAmountOut = parseUnits(params.minOut, 18)
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
            args: [contracts.amm as `0x${string}`, amountIn * BigInt(2)],
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

      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      return receipt
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['pool'] })
      queryClient.invalidateQueries({ queryKey: ['swapQuote'] })
      queryClient.invalidateQueries({ queryKey: ['recentSwaps'] })
      queryClient.invalidateQueries({ queryKey: ['userHoldings'] })
    },
  })
}
