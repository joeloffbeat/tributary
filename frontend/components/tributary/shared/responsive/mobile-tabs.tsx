'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
}

interface MobileTabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
}

export function MobileTabs({ tabs, activeTab, onChange }: MobileTabsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const activeTabData = tabs.find((t) => t.id === activeTab)

  return (
    <div className="md:hidden">
      {/* Selected Tab Display */}
      <Button
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between bg-river-800/50"
      >
        <span className="flex items-center gap-2">
          {activeTabData?.icon}
          {activeTabData?.label}
        </span>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </Button>

      {/* Dropdown */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 bg-river-800/50 border border-river-700 rounded-lg overflow-hidden"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onChange(tab.id)
                setIsExpanded(false)
              }}
              className={cn(
                'w-full flex items-center gap-2 px-4 py-3 text-left transition-colors',
                tab.id === activeTab
                  ? 'bg-tributary-500/10 text-tributary-400'
                  : 'hover:bg-river-700/50 text-river-300'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}
