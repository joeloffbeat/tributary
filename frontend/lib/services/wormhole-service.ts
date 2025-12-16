/**
 * Wormhole Bridge Service
 *
 * Stub service for Wormhole bridge integration.
 * TODO: Implement full Wormhole SDK integration
 */

import type { Address } from 'viem'
import type { BridgeToken, BridgeQuote } from '@/lib/types/bridge'

// =============================================================================
// Types
// =============================================================================

export type WormholeProtocol = 'TokenBridge' | 'CCTPBridge' | 'AutomaticBridge'

export interface WormholeQuote {
  provider: 'wormhole'
  sourceChain: string
  destinationChain: string
  token: BridgeToken
  amount: string
  estimatedOutput: string
  fees: {
    bridge: string
    gas: string
    total: string
  }
  estimatedTime: number
  slippage: number
  minReceived: string
  protocol?: WormholeProtocol
}

export interface WormholeTransferParams {
  sourceChainId: number
  destinationChainId: number
  token: Address | 'native'
  amount: bigint
  recipient: Address
  protocol?: WormholeProtocol
}

// =============================================================================
// Service
// =============================================================================

class WormholeService {
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return
    // TODO: Initialize Wormhole SDK
    this.initialized = true
  }

  areChainsCompatible(sourceChainId: number, destinationChainId: number): boolean {
    // Both must be testnets or both mainnets
    const testnetChains = [11155111, 43113, 80002, 1513] // sepolia, fuji, amoy, story aeneid
    const sourceIsTestnet = testnetChains.includes(sourceChainId)
    const destIsTestnet = testnetChains.includes(destinationChainId)
    return sourceIsTestnet === destIsTestnet
  }

  async getQuote(
    sourceChain: string,
    destinationChain: string,
    token: BridgeToken,
    amount: string,
    _sourceAddress: string,
    _destinationAddress: string
  ): Promise<BridgeQuote> {
    // Mock quote for now
    const amountNum = parseFloat(amount)
    const baseFee = 0.001
    const gasFee = 0.005
    const totalFee = baseFee + gasFee
    const outputAmount = Math.max(0, amountNum - totalFee)

    return {
      provider: 'wormhole',
      sourceChain: { id: 1, name: sourceChain, logoUrl: '' } as any,
      destinationChain: { id: 2, name: destinationChain, logoUrl: '' } as any,
      token,
      amount,
      estimatedOutput: outputAmount.toString(),
      fees: {
        bridge: baseFee.toString(),
        gas: gasFee.toString(),
        total: totalFee.toString(),
      },
      estimatedTime: 900, // 15 minutes
      slippage: 0.5,
      minReceived: (outputAmount * 0.995).toString(),
    }
  }

  async getTransferQuote(params: WormholeTransferParams): Promise<WormholeQuote> {
    const { sourceChainId, destinationChainId, amount } = params
    const amountNum = Number(amount) / 1e18
    const baseFee = 0.001
    const gasFee = 0.005
    const totalFee = baseFee + gasFee
    const outputAmount = Math.max(0, amountNum - totalFee)

    return {
      provider: 'wormhole',
      sourceChain: `chain-${sourceChainId}`,
      destinationChain: `chain-${destinationChainId}`,
      token: {
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
        addresses: { [sourceChainId]: '0x0000000000000000000000000000000000000000' },
        logoUrl: '/tokens/eth.png',
        isNative: true,
      },
      amount: amountNum.toString(),
      estimatedOutput: outputAmount.toString(),
      fees: {
        bridge: baseFee.toString(),
        gas: gasFee.toString(),
        total: totalFee.toString(),
      },
      estimatedTime: 900,
      slippage: 0.5,
      minReceived: (outputAmount * 0.995).toString(),
    }
  }
}

export const wormholeService = new WormholeService()
