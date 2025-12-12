'use client'

import { HoverEffect } from '@/components/ui/hover-effect'
import {
  Repeat,
  Database,
  Server,
  Zap,
  Blocks,
  Palette,
} from 'lucide-react'

const sections = [
  {
    title: 'Cross-Chain',
    icon: Repeat,
    link: '/playground/crosschain',
  },
  {
    title: 'Indexer',
    icon: Database,
    link: '/playground/indexer',
  },
  {
    title: 'Database',
    icon: Server,
    link: '/playground/db',
  },
  {
    title: 'x402',
    icon: Zap,
    link: '/playground/x402',
  },
  {
    title: 'Protocols',
    icon: Blocks,
    link: '/playground/protocols',
  },
  {
    title: 'UI',
    icon: Palette,
    link: '/playground/ui',
  },
]

export default function PlaygroundPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Playground</h1>
          <p className="text-muted-foreground">
            Test and explore EVM integrations
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <HoverEffect items={sections} />
        </div>
      </div>
    </main>
  )
}
