'use client'

import { useState } from 'react'
import { useAccount, useSwitchChain, ConnectButton } from '@/lib/web3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DollarSign,
  Coins,
  AlertTriangle,
  AlertCircle,
  Loader2,
  ArrowRightLeft,
} from 'lucide-react'
import { useCrosschainStory } from './hooks/use-crosschain-story'
import { CrosschainProgress } from './components/crosschain-progress'
import { MANTLE_SEPOLIA_CHAIN_ID } from './constants'
import { STORY_CONTRACTS, DISPUTE_TAGS } from '@/constants/protocols/story'

export default function StoryPage() {
  const { isConnected, chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const { state, payRoyalty, claimRevenue, raiseDispute, reset, getExplorerLinks } =
    useCrosschainStory()
  const [activeTab, setActiveTab] = useState('pay-royalty')

  const isOnMantle = chain?.id === MANTLE_SEPOLIA_CHAIN_ID
  const explorerLinks = getExplorerLinks()

  // Form states
  const [royaltyIpId, setRoyaltyIpId] = useState('')
  const [royaltyAmount, setRoyaltyAmount] = useState('')
  const [claimIpId, setClaimIpId] = useState('')
  const [claimChildIds, setClaimChildIds] = useState('')
  const [disputeIpId, setDisputeIpId] = useState('')
  const [disputeEvidence, setDisputeEvidence] = useState('')
  const [disputeTag, setDisputeTag] = useState('')

  if (!isConnected) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <ConnectButton />
          </CardContent>
        </Card>
      </main>
    )
  }

  // Show progress if operation is in progress
  if (state.step !== 'idle') {
    const operationNames = {
      'pay-royalty': 'Pay Royalty',
      'claim-revenue': 'Claim Revenue',
      'raise-dispute': 'Raise Dispute',
    }
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-lg mx-auto">
            <CrosschainProgress
              state={state}
              operationName={operationNames[activeTab as keyof typeof operationNames]}
              onReset={reset}
              explorerLinks={explorerLinks}
            />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Cross-Chain Story Protocol</h1>
          <p className="text-muted-foreground">
            Execute Story Protocol operations from Mantle Sepolia
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Mantle</span>
            <ArrowRightLeft className="h-4 w-4" />
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">Story</span>
          </div>
        </div>

        <div className="max-w-lg mx-auto space-y-4">
          {/* Chain Guard */}
          {!isOnMantle && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Switch to Mantle Sepolia to perform cross-chain operations</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => switchChain?.(MANTLE_SEPOLIA_CHAIN_ID)}
                >
                  Switch
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pay-royalty" className="gap-1">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Pay Royalty</span>
              </TabsTrigger>
              <TabsTrigger value="claim-revenue" className="gap-1">
                <Coins className="h-4 w-4" />
                <span className="hidden sm:inline">Claim Revenue</span>
              </TabsTrigger>
              <TabsTrigger value="raise-dispute" className="gap-1">
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Raise Dispute</span>
              </TabsTrigger>
            </TabsList>

            {/* Pay Royalty Tab */}
            <TabsContent value="pay-royalty">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pay Royalty
                  </CardTitle>
                  <CardDescription>
                    Pay royalties to an IP Asset on Story via Hyperlane
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Receiver IP ID</Label>
                    <Input
                      placeholder="0x..."
                      value={royaltyIpId}
                      onChange={(e) => setRoyaltyIpId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount (WIP)</Label>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={royaltyAmount}
                      onChange={(e) => setRoyaltyAmount(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!isOnMantle || !royaltyIpId || !royaltyAmount}
                    onClick={() =>
                      payRoyalty(royaltyIpId, STORY_CONTRACTS.WIP_TOKEN, royaltyAmount)
                    }
                  >
                    {!isOnMantle ? 'Switch to Mantle' : 'Pay Royalty via Hyperlane'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Claim Revenue Tab */}
            <TabsContent value="claim-revenue">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Claim Revenue
                  </CardTitle>
                  <CardDescription>
                    Claim accumulated royalty revenue from your IP on Story
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Your IP ID (Ancestor)</Label>
                    <Input
                      placeholder="0x..."
                      value={claimIpId}
                      onChange={(e) => setClaimIpId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Child IP IDs (optional, comma separated)</Label>
                    <Input
                      placeholder="0x..., 0x..."
                      value={claimChildIds}
                      onChange={(e) => setClaimChildIds(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!isOnMantle || !claimIpId}
                    onClick={() => {
                      const childIds = claimChildIds
                        .split(',')
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0)
                      claimRevenue(claimIpId, [STORY_CONTRACTS.WIP_TOKEN], childIds)
                    }}
                  >
                    {!isOnMantle ? 'Switch to Mantle' : 'Claim Revenue via Hyperlane'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Raise Dispute Tab */}
            <TabsContent value="raise-dispute">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Raise Dispute
                  </CardTitle>
                  <CardDescription>
                    File a dispute against an IP Asset on Story
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Target IP ID</Label>
                    <Input
                      placeholder="0x..."
                      value={disputeIpId}
                      onChange={(e) => setDisputeIpId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dispute Category</Label>
                    <Select value={disputeTag} onValueChange={setDisputeTag}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {DISPUTE_TAGS.map((tag) => (
                          <SelectItem key={tag.value} value={tag.value}>
                            {tag.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Evidence IPFS CID</Label>
                    <Input
                      placeholder="QmYour..."
                      value={disputeEvidence}
                      onChange={(e) => setDisputeEvidence(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!isOnMantle || !disputeIpId || !disputeTag || !disputeEvidence}
                    onClick={() => raiseDispute(disputeIpId, disputeEvidence, disputeTag)}
                  >
                    {!isOnMantle ? 'Switch to Mantle' : 'Raise Dispute via Hyperlane'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Info Box */}
          <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium mb-1">How it works:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Submit transaction on Mantle Sepolia</li>
              <li>Hyperlane relays message to Story</li>
              <li>Operation executes on Story Protocol</li>
            </ol>
            <p className="mt-2 text-xs">Cross-chain delivery typically takes 1-5 minutes</p>
          </div>
        </div>
      </div>
    </main>
  )
}
