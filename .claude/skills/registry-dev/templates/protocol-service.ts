// ============================================================================
// TEMPLATE: Protocol Service
// Replace: PROTOCOL_NAME, API endpoints, request/response types
// ============================================================================

import { Address } from 'viem'

// ============================================================================
// Types
// ============================================================================

interface QuoteParams {
  tokenIn: Address
  tokenOut: Address
  amountIn: bigint
  chainId: number
}

interface QuoteResult {
  amountOut: bigint
  route: Address[]
  estimatedGas: bigint
  priceImpact: number
}

interface SwapParams extends QuoteParams {
  recipient: Address
  slippage: number // 0.5 = 0.5%
  deadline?: number // Unix timestamp
}

interface SwapResult {
  to: Address
  data: `0x${string}`
  value: bigint
}

// ============================================================================
// Service
// ============================================================================

class ProtocolNameService {
  private baseUrl = 'https://api.protocol-name.com/v1'

  /**
   * Get quote for token swap
   */
  async getQuote(params: QuoteParams): Promise<QuoteResult> {
    const response = await fetch(`${this.baseUrl}/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amount: params.amountIn.toString(),
        chainId: params.chainId,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `Quote failed: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      amountOut: BigInt(data.amountOut),
      route: data.route,
      estimatedGas: BigInt(data.estimatedGas),
      priceImpact: data.priceImpact,
    }
  }

  /**
   * Get swap transaction data
   */
  async getSwap(params: SwapParams): Promise<SwapResult> {
    const response = await fetch(`${this.baseUrl}/swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amount: params.amountIn.toString(),
        recipient: params.recipient,
        slippage: Math.round(params.slippage * 100), // Convert to basis points
        deadline: params.deadline || Math.floor(Date.now() / 1000) + 1800, // 30 min default
        chainId: params.chainId,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `Swap failed: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      to: data.to as Address,
      data: data.data as `0x${string}`,
      value: BigInt(data.value || '0'),
    }
  }

  /**
   * Get supported tokens for a chain
   */
  async getTokens(chainId: number): Promise<
    Array<{
      address: Address
      symbol: string
      decimals: number
      name: string
      logoURI?: string
    }>
  > {
    const response = await fetch(`${this.baseUrl}/tokens?chainId=${chainId}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch tokens: ${response.statusText}`)
    }

    return response.json()
  }
}

export const protocolNameService = new ProtocolNameService()
