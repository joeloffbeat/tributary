'use client'

import { ShoppingCart, Tag, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatUSDC, formatTokenAmount } from '@/lib/utils'
import { formatAddress } from '@/lib/web3/format'
import type { TributaryVault } from '../../types'

interface MockListing {
  id: string; seller: `0x${string}`; amount: bigint; pricePerToken: bigint; isPrimarySale: boolean; expiresAt: number
}

function getMockListings(vault: TributaryVault): MockListing[] {
  if (vault.tokenPrice === 0n) return []
  return [{
    id: '1', seller: vault.creator, amount: vault.totalSupply / 10n, pricePerToken: vault.tokenPrice,
    isPrimarySale: true, expiresAt: Math.floor(Date.now() / 1000) + 86400 * 30,
  }]
}

function ListingCard({ listing, tokenSymbol, decimals }: { listing: MockListing; tokenSymbol: string; decimals: number }) {
  const totalPrice = (listing.amount * listing.pricePerToken) / BigInt(10 ** decimals)
  const expiresIn = Math.floor((listing.expiresAt - Date.now() / 1000) / 86400)

  return (
    <Card className="bg-river-800/30 border-river-700">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Badge className={listing.isPrimarySale ? 'bg-tributary-500/20 text-tributary-400 border-tributary-500/30' : 'bg-river-700/50 text-river-300'}>
            {listing.isPrimarySale ? 'Primary Sale' : 'Secondary'}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-river-400"><Clock className="h-3 w-3" />{expiresIn}d left</div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-river-400">Amount</span>
            <span className="font-mono text-foreground">{formatTokenAmount(listing.amount, decimals)} {tokenSymbol}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-river-400">Price/token</span>
            <span className="font-mono text-foreground">{formatUSDC(listing.pricePerToken)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-river-700/50">
            <span className="text-sm font-medium text-river-400">Total</span>
            <span className="text-sm font-mono font-semibold text-tributary-400">{formatUSDC(totalPrice)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-river-500">Seller: {formatAddress(listing.seller)}</span>
          <Button size="sm" className="bg-tributary-500 hover:bg-tributary-600"><ShoppingCart className="h-3 w-3 mr-1" />Buy</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function VaultTradeTab({ vault }: { vault: TributaryVault }) {
  const listings = getMockListings(vault)
  return (
    <div className="space-y-6">
      <Card className="bg-river-800/30 border-river-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3"><Tag className="h-4 w-4 text-tributary-500" /><span className="text-sm font-medium text-river-400">Market Stats</span></div>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-river-500">Floor Price</p><p className="text-lg font-mono font-semibold text-foreground">{formatUSDC(vault.tokenPrice)}</p></div>
            <div><p className="text-xs text-river-500">Active Listings</p><p className="text-lg font-semibold text-foreground">{listings.length}</p></div>
          </div>
        </CardContent>
      </Card>

      {listings.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-river-400">Available Listings</h4>
          {listings.map((listing) => <ListingCard key={listing.id} listing={listing} tokenSymbol={vault.tokenSymbol} decimals={vault.tokenDecimals} />)}
        </div>
      ) : (
        <Card className="bg-river-800/30 border-river-700">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-8 w-8 text-river-600 mx-auto mb-3" />
            <p className="text-sm text-river-400">No active listings</p>
            <p className="text-xs text-river-500 mt-1">Check back later for secondary market opportunities</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
