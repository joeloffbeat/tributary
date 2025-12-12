'use client'

import { HoverEffect } from '@/components/ui/hover-effect'
import { Mountain } from 'lucide-react'

const networks = [
  {
    title: 'Avalanche Fuji',
    icon: Mountain,
    link: '/x402/avalanche',
  },
]

export default function X402Page() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">x402 Payment Protocol</h1>
          <p className="text-muted-foreground">
            HTTP 402 Payment Protocol - Monetize APIs with micropayments
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <HoverEffect items={networks} className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
        </div>
      </div>
    </main>
  )
}
