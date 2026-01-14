'use client'

import { BarChart3, TrendingUp, Calendar, DollarSign } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatUSDC } from '@/lib/utils'
import type { TributaryVault } from '../../types'

interface VaultAnalyticsTabProps {
  vault: TributaryVault
}

export function VaultAnalyticsTab({ vault }: VaultAnalyticsTabProps) {
  // Calculate mock analytics - in production, fetch from subgraph
  const avgMonthlyDistribution = vault.totalDistributed > 0n
    ? vault.totalDistributed / 6n // Assuming 6 months of data
    : 0n

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-river-800/30 border-river-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-tributary-500" />
              <span className="text-xs text-river-400">Total Distributed</span>
            </div>
            <div className="text-xl font-semibold text-foreground font-mono">
              {formatUSDC(vault.totalDistributed)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-river-800/30 border-river-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-tributary-500" />
              <span className="text-xs text-river-400">Avg Monthly</span>
            </div>
            <div className="text-xl font-semibold text-foreground font-mono">
              {formatUSDC(avgMonthlyDistribution)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Royalty History Chart Placeholder */}
      <Card className="bg-river-800/30 border-river-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-tributary-500" />
            <h4 className="text-sm font-medium text-river-400">Royalty History</h4>
          </div>
          {/* Chart placeholder - integrate with recharts in production */}
          <div className="h-48 flex items-center justify-center rounded-lg bg-river-900/50">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-river-600 mx-auto mb-2" />
              <p className="text-sm text-river-500">Analytics chart coming soon</p>
              <p className="text-xs text-river-600 mt-1">
                Historical distribution data will appear here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribution Stats */}
      <Card className="bg-river-800/30 border-river-700">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-river-400 mb-4">Distribution Stats</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-river-400">Total Deposited</span>
              <span className="text-sm text-foreground font-mono">{formatUSDC(vault.totalValue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-river-400">Total Distributed</span>
              <span className="text-sm text-foreground font-mono">{formatUSDC(vault.totalDistributed)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-river-400">Current APY</span>
              <span className="text-sm text-emerald-500 font-mono">+{vault.apy.toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
