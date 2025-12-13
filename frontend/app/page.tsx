'use client'

import { useState, useCallback } from 'react'
import { Store, ShoppingBag, Package, Wallet, Plus } from 'lucide-react'
import { useAccount, ConnectButton } from '@/lib/web3'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { MarketplaceTab } from './ipay/components/marketplace-tab'
import { MyAssetsTab } from '@/components/protocols/story'
import { RegisterIPADialog } from './ipay/components/register-ipa'
import { toast } from 'sonner'

type TabValue = 'marketplace' | 'my-listings' | 'my-purchases' | 'my-assets'

export default function Home() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<TabValue>('marketplace')
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false)

  const handleRegistrationSuccess = useCallback(() => {
    toast.success('IP registration submitted!', {
      description: 'Your cross-chain registration request has been sent.',
    })
  }, [])

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
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">IPay Marketplace</h1>
          <p className="text-muted-foreground">
            Pay-per-use IP licensing powered by Story Protocol
          </p>
        </div>
        <Button onClick={() => setRegisterDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Register IPA
        </Button>
      </div>

      <RegisterIPADialog
        open={registerDialogOpen}
        onOpenChange={setRegisterDialogOpen}
        onSuccess={handleRegistrationSuccess}
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
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
          <TabsTrigger value="my-assets" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            My Assets
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

        <TabsContent value="my-assets">
          <MyAssetsTab address={address} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
