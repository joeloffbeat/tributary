'use client'

import { TrendingUp, Users, Coins, PiggyBank, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { YieldDisplay } from '@/components/tributary/shared/yield-display'
import { formatUSDC, formatTokenAmount } from '@/lib/utils'
import type { TributaryVault } from '../../types'

interface VaultOverviewTabProps {
  vault: TributaryVault
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon: LucideIcon }) {
  return (
    <Card className="bg-river-800/30 border-river-700">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-4 w-4 text-tributary-500" />
          <span className="text-xs text-river-400">{label}</span>
        </div>
        <div className="text-lg font-semibold text-foreground">{value}</div>
      </CardContent>
    </Card>
  )
}

export function VaultOverviewTab({ vault }: VaultOverviewTabProps) {
  const distributedPercent = vault.totalSupply > 0n
    ? ((Number(vault.totalSupply) - Number(vault.availableTokens)) / Number(vault.totalSupply)) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Value" value={formatUSDC(vault.totalValue)} icon={PiggyBank} />
        <MetricCard label="APY" value={<YieldDisplay apy={vault.apy} size="sm" />} icon={TrendingUp} />
        <MetricCard label="Holders" value={vault.holderCount.toLocaleString()} icon={Users} />
        <MetricCard label="Token Price" value={formatUSDC(vault.tokenPrice)} icon={Coins} />
      </div>

      {/* Description */}
      <Card className="bg-river-800/30 border-river-700">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-river-400 mb-2">About</h4>
          <p className="text-sm text-river-200">
            {vault.ipAsset?.nftMetadata?.description ||
              `Tokenized royalties from ${vault.tokenName}. Hold tokens to receive your share of royalty distributions.`}
          </p>
        </CardContent>
      </Card>

      {/* IP Asset Info */}
      {vault.ipAsset && (
        <Card className="bg-river-800/30 border-river-700">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium text-river-400 mb-3">IP Asset Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-river-400">IP ID</span>
                <span className="font-mono text-tributary-400">
                  {vault.storyIPId.slice(0, 10)}...{vault.storyIPId.slice(-8)}
                </span>
              </div>
              {vault.ipAsset.licenses?.[0] && (
                <div className="flex justify-between">
                  <span className="text-river-400">License</span>
                  <span className="text-river-200">
                    {vault.ipAsset.licenses[0].terms.commercialUse ? 'Commercial' : 'Non-Commercial'}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Token Distribution */}
      <Card className="bg-river-800/30 border-river-700">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-river-400 mb-3">Token Availability</h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-river-400">Available</span>
              <span className="text-river-200 font-mono">
                {formatTokenAmount(vault.availableTokens, vault.tokenDecimals)} {vault.tokenSymbol}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-river-400">Total Supply</span>
              <span className="text-river-200 font-mono">
                {formatTokenAmount(vault.totalSupply, vault.tokenDecimals)} {vault.tokenSymbol}
              </span>
            </div>
            <div className="h-2 bg-river-700 rounded-full overflow-hidden">
              <div className="h-full bg-tributary-500 transition-all" style={{ width: `${distributedPercent}%` }} />
            </div>
            <p className="text-xs text-river-500">{distributedPercent.toFixed(1)}% distributed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
