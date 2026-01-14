'use client'

import { Users, Crown, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatAddress } from '@/lib/web3/format'
import { formatTokenAmount } from '@/lib/utils'
import type { TributaryVault, VaultHolder } from '../../types'

const EXPLORER_URL = 'https://sepolia.mantlescan.xyz'

function getMockHolders(vault: TributaryVault): VaultHolder[] {
  return [
    { address: vault.creator, balance: vault.totalSupply / 2n, percentage: 50, unclaimedRewards: 0n },
    { address: '0x1234567890123456789012345678901234567890' as `0x${string}`, balance: vault.totalSupply / 4n, percentage: 25, unclaimedRewards: 0n },
    { address: '0x2345678901234567890123456789012345678901' as `0x${string}`, balance: vault.totalSupply / 8n, percentage: 12.5, unclaimedRewards: 0n },
  ]
}

function HolderRow({ holder, rank, tokenSymbol, decimals }: {
  holder: VaultHolder; rank: number; tokenSymbol: string; decimals: number
}) {
  const isCreator = rank === 1
  return (
    <div className="flex items-center justify-between py-3 border-b border-river-700/50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-river-700 flex items-center justify-center text-xs font-medium">
          {isCreator ? <Crown className="h-3 w-3 text-amber-500" /> : rank}
        </div>
        <div>
          <a href={`${EXPLORER_URL}/address/${holder.address}`} target="_blank" rel="noopener noreferrer"
            className="text-sm font-mono text-tributary-400 hover:text-tributary-300 flex items-center gap-1">
            {formatAddress(holder.address)}
            <ExternalLink className="h-3 w-3" />
          </a>
          {isCreator && <span className="text-xs text-amber-500/70">Creator</span>}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-mono text-foreground">{formatTokenAmount(holder.balance, decimals)} {tokenSymbol}</div>
        <div className="text-xs text-river-400">{holder.percentage.toFixed(1)}%</div>
      </div>
    </div>
  )
}

export function VaultHoldersTab({ vault }: { vault: TributaryVault }) {
  const holders = getMockHolders(vault)
  return (
    <div className="space-y-6">
      <Card className="bg-river-800/30 border-river-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-tributary-500" />
            <span className="text-sm font-medium text-river-400">Token Holders</span>
          </div>
          <div className="text-2xl font-semibold text-foreground">{vault.holderCount || holders.length}</div>
          <p className="text-xs text-river-500 mt-1">Unique addresses holding {vault.tokenSymbol}</p>
        </CardContent>
      </Card>

      <Card className="bg-river-800/30 border-river-700">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-river-400 mb-4">Top Holders</h4>
          <div className="space-y-0">
            {holders.map((holder, index) => (
              <HolderRow key={holder.address} holder={holder} rank={index + 1} tokenSymbol={vault.tokenSymbol} decimals={vault.tokenDecimals} />
            ))}
          </div>
          {vault.holderCount > holders.length && (
            <p className="text-xs text-river-500 mt-4 text-center">+{vault.holderCount - holders.length} more holders</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
