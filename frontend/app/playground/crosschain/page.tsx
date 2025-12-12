'use client'

import { HoverEffect } from '@/components/ui/hover-effect'
import {
  Coins,
  Link2,
  Cookie,
  Droplets,
  Layers,
  Circle,
  Zap,
  Route,
  Network,
  ArrowLeftRight,
  Beef,
  Box,
} from 'lucide-react'

// Cross-Chain Swaps Only - Protocols that primarily facilitate token swaps across chains
const swapProtocols = [
  {
    title: '1inch',
    description: 'Direct self-custodial swaps between Solana and EVM chains',
    icon: Coins,
    link: '/crosschain/1inch',
  },
  {
    title: 'PancakeSwap',
    description: 'One-click swaps across chains via Across integration',
    icon: Cookie,
    link: '/crosschain/pancakeswap',
  },
  {
    title: 'Uniswap',
    description: 'Cross-chain swaps via Across intents across EVM chains',
    icon: Droplets,
    link: '/crosschain/uniswap',
  },
  {
    title: 'LI.FI',
    description: 'DEX and bridge aggregator for seamless cross-chain swaps',
    icon: Zap,
    link: '/crosschain/lifi',
  },
  {
    title: 'CoW Swap',
    description: 'Swap-and-bridge for different tokens across networks',
    icon: Beef,
    link: '/crosschain/cowswap',
  },
  {
    title: 'Avail Nexus',
    description: '1-click swaps via LI.FI and 0x across 10+ chains',
    icon: Box,
    link: '/crosschain/avail-nexus',
  },
]

// Swaps + Messaging - Interoperability layers that enable both messaging and swaps
const swapAndMessagingProtocols = [
  {
    title: 'Chainlink CCIP',
    description: 'Secure messaging and token transfers across chains',
    icon: Link2,
    link: '/crosschain/ccip',
  },
  {
    title: 'LayerZero',
    description: 'Omnichain messaging for apps like cross-chain swaps',
    icon: Layers,
    link: '/crosschain/layerzero',
  },
  {
    title: 'Wormhole',
    description: 'Messaging for token transfers and cross-chain communication',
    icon: Circle,
    link: '/crosschain/wormhole',
  },
  {
    title: 'Hyperlane',
    description: 'Core messaging with Warp Routes for token bridging',
    icon: Route,
    link: '/crosschain/hyperlane',
  },
  {
    title: 'Axelar',
    description: 'General message passing enables swaps via Squid',
    icon: Network,
    link: '/crosschain/axelar',
  },
  {
    title: 'Across Protocol',
    description: 'Intents-based bridging for fast swaps via user outcomes',
    icon: ArrowLeftRight,
    link: '/crosschain/across',
  },
]

export default function CrosschainPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-2">Cross-Chain</h1>
          <p className="text-muted-foreground">
            Cross-chain swap and messaging protocols for interoperability
          </p>
        </div>

        {/* Swaps Section */}
        <div className="mb-16">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Swaps</h2>
            <p className="text-muted-foreground text-sm">
              Protocols that primarily facilitate token swaps across chains via aggregation, intents, or integrated bridges
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <HoverEffect items={swapProtocols} className="grid-cols-2 md:grid-cols-3" />
          </div>
        </div>

        {/* Swaps + Messaging Section */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Swaps + Messaging</h2>
            <p className="text-muted-foreground text-sm">
              Interoperability layers that enable general messaging and also support token swaps or transfers
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <HoverEffect items={swapAndMessagingProtocols} className="grid-cols-2 md:grid-cols-3" />
          </div>
        </div>
      </div>
    </main>
  )
}
