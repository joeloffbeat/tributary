'use client'

import { useState } from 'react'
import { useAccount } from '@/lib/web3'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PortfolioHero } from './components/portfolio-hero'
import { HoldingsList } from './components/holdings-list'
import { ClaimAllButton } from './components/claim-all-button'
import { InvestmentHistory } from './components/investment-history'
import { usePortfolioStats } from './hooks/use-portfolio-stats'
import { ConnectWalletPrompt } from '@/components/tributary/shared/connect-wallet-prompt'

export function PortfolioPage() {
  const { address, isConnected } = useAccount()
  const { data: stats, isLoading, refetch } = usePortfolioStats(address)
  const [activeTab, setActiveTab] = useState('holdings')

  if (!isConnected) {
    return <ConnectWalletPrompt message="Connect your wallet to view your portfolio" />
  }

  return (
    <div className="space-y-8">
      {/* Hero Section with Stats */}
      <PortfolioHero stats={stats || null} isLoading={isLoading} />

      {/* Quick Actions */}
      <div className="flex gap-4">
        <ClaimAllButton
          pendingRewards={stats?.totalPendingRewards || 0n}
          holdings={stats?.holdings || []}
          onSuccess={refetch}
        />
      </div>

      {/* Tabs: Holdings, History */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-river-800/50">
          <TabsTrigger value="holdings">My Holdings</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings" className="mt-6">
          <HoldingsList holdings={stats?.holdings || []} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <InvestmentHistory address={address} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
