'use client'

import { ConnectButton } from '@/lib/web3'

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-6xl font-bold mb-4">IPay</h1>
          <p className="text-xl text-muted-foreground">Coming Soon</p>
        </div>
        <ConnectButton />
      </div>
    </main>
  )
}
