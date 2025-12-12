'use client'

import { useState } from 'react'
import { Store, ShoppingBag, Package } from 'lucide-react'
import { useAccount, ConnectButton } from '@/lib/web3'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MarketplaceTab } from './components/marketplace-tab'

type TabValue = 'marketplace' | 'my-listings' | 'my-purchases'

export default function IPayPage() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<TabValue>('marketplace')

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <Store className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">IPay Marketplace</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Pay-per-use IP licensing on-chain. Connect your wallet to browse and license intellectual property.
          </p>
          <ConnectButton />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">IPay Marketplace</h1>
        <p className="text-muted-foreground">
          Pay-per-use IP licensing powered by Story Protocol
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="my-listings" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            My Listings
          </TabsTrigger>
          <TabsTrigger value="my-purchases" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            My Purchases
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace">
          <MarketplaceTab address={address} />
        </TabsContent>

        <TabsContent value="my-listings">
          <div className="text-center py-12 rounded-lg border bg-card">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="text-lg font-medium mb-2">My Listings</h4>
            <p className="text-sm text-muted-foreground">
              Your listed IP assets will appear here
            </p>
          </div>
        </TabsContent>

        <TabsContent value="my-purchases">
          <div className="text-center py-12 rounded-lg border bg-card">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="text-lg font-medium mb-2">My Purchases</h4>
            <p className="text-sm text-muted-foreground">
              Your purchased IP licenses will appear here
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
