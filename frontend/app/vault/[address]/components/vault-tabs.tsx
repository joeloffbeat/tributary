'use client'

import { useState } from 'react'
import { OverviewTab } from '../tabs/overview-tab'
import { AnalyticsTab } from '../tabs/analytics-tab'
import { HoldersTab } from '../tabs/holders-tab'
import { TradeHistoryTab } from '../tabs/trade-history-tab'
import { VaultDetail } from '@/hooks/use-vault-detail'

const TABS = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'analytics', label: 'ANALYTICS' },
  { id: 'holders', label: 'HOLDERS' },
  { id: 'history', label: 'TRADE HISTORY' },
]

interface VaultTabsProps {
  vault: VaultDetail
}

export function VaultTabs({ vault }: VaultTabsProps) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex gap-1 border-b border-cream-dark mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-body text-sm transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-tributary text-tributary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <OverviewTab vault={vault} />}
        {activeTab === 'analytics' && <AnalyticsTab vault={vault} />}
        {activeTab === 'holders' && <HoldersTab vault={vault} />}
        {activeTab === 'history' && <TradeHistoryTab vault={vault} />}
      </div>
    </div>
  )
}
