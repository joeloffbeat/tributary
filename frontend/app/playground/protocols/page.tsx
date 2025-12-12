'use client'

import { HoverEffect } from '@/components/ui/hover-effect'
import {
  AtSign,
  Link,
  TrendingUp,
  Flame,
  HardDrive,
  Box,
  Sparkles,
  Circle,
  Hexagon,
  Gem,
  Binary,
  Layers,
  Waves,
  BookOpen,
} from 'lucide-react'

const protocols = [
  {
    title: 'ENS',
    icon: AtSign,
    link: '/protocols/ens',
  },
  {
    title: 'Chainlink',
    icon: Link,
    link: '/protocols/chainlink',
  },
  {
    title: 'Pyth',
    icon: TrendingUp,
    link: '/protocols/pyth',
  },
  {
    title: 'Chiliz',
    icon: Flame,
    link: '/protocols/chiliz',
  },
  {
    title: 'Filecoin',
    icon: HardDrive,
    link: '/protocols/filecoin',
  },
  {
    title: 'Protocol Labs',
    icon: Box,
    link: '/protocols/protocol-labs',
  },
  {
    title: 'Flare',
    icon: Sparkles,
    link: '/protocols/flare',
  },
  {
    title: 'Circle',
    icon: Circle,
    link: '/protocols/circle',
  },
  {
    title: 'Polygon',
    icon: Hexagon,
    link: '/protocols/polygon',
  },
  {
    title: 'Citrea',
    icon: Gem,
    link: '/protocols/citrea',
  },
  {
    title: '0G',
    icon: Binary,
    link: '/protocols/0g',
  },
  {
    title: 'vLayer',
    icon: Layers,
    link: '/protocols/vlayer',
  },
  {
    title: 'Fluence',
    icon: Waves,
    link: '/protocols/fluence',
  },
  {
    title: 'Story Protocol',
    icon: BookOpen,
    link: '/protocols/story',
  },
]

export default function ProtocolsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Protocols</h1>
          <p className="text-muted-foreground">
            Explore integrations with various blockchain protocols
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <HoverEffect items={protocols} />
        </div>
      </div>
    </main>
  )
}
