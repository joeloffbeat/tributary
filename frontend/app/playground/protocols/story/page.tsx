'use client'

import { ExternalLink, FileText, Shield, GitBranch, Coins, Gavel, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useAccount, ConnectButton } from '@/lib/web3'
import { useStoryClient } from '@/hooks/protocols/story'
import { STORY_DOCS, STORY_EXPLORER, STORY_FAUCET } from '@/constants/protocols/story'
import {
  RegisterIPTab,
  LicenseTab,
  DerivativeTab,
  DisputesTab,
  RoyaltyTab,
  MyAssetsTab,
} from '@/components/protocols/story'

export default function StoryProtocolPage() {
  const { address, isConnected } = useAccount()
  const { getClient } = useStoryClient()

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Story Protocol</h1>
            <p className="text-muted-foreground">
              Register and manage Intellectual Property on-chain
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <a href={STORY_DOCS} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  Documentation
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href={STORY_EXPLORER} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  Explorer
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href={STORY_FAUCET} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  Faucet
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>

          {/* Connect Wallet Card */}
          <div className="rounded-lg border bg-card p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Please connect your wallet to interact with Story Protocol
            </p>
            <ConnectButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Story Protocol</h1>
          <p className="text-muted-foreground">
            Register and manage Intellectual Property on-chain
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <a href={STORY_DOCS} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                Documentation
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href={STORY_EXPLORER} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                Explorer
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href={STORY_FAUCET} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                Faucet
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="register" className="space-y-6">
          <TabsList className="flex flex-wrap gap-2 h-auto bg-transparent p-0">
            <TabsTrigger
              value="register"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileText className="h-4 w-4 mr-2" />
              Register IP
            </TabsTrigger>
            <TabsTrigger
              value="license"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Shield className="h-4 w-4 mr-2" />
              License
            </TabsTrigger>
            <TabsTrigger
              value="derivative"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <GitBranch className="h-4 w-4 mr-2" />
              Derivatives
            </TabsTrigger>
            <TabsTrigger
              value="royalty"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Coins className="h-4 w-4 mr-2" />
              Royalties
            </TabsTrigger>
            <TabsTrigger
              value="disputes"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Gavel className="h-4 w-4 mr-2" />
              Disputes
            </TabsTrigger>
            <TabsTrigger
              value="assets"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Wallet className="h-4 w-4 mr-2" />
              My Assets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="register">
            <RegisterIPTab getClient={getClient} address={address} />
          </TabsContent>

          <TabsContent value="license">
            <LicenseTab getClient={getClient} address={address} />
          </TabsContent>

          <TabsContent value="derivative">
            <DerivativeTab getClient={getClient} address={address} />
          </TabsContent>

          <TabsContent value="royalty">
            <RoyaltyTab getClient={getClient} address={address} />
          </TabsContent>

          <TabsContent value="disputes">
            <DisputesTab getClient={getClient} address={address} />
          </TabsContent>

          <TabsContent value="assets">
            <MyAssetsTab address={address} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
