'use client'

import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useOutsideClick } from '@/hooks/use-outside-click'
import type { TributaryVault } from '../types'
import { VaultDialogHeader } from './vault-dialog-header'
import { VaultOverviewTab } from './vault-dialog-tabs/overview-tab'
import { VaultAnalyticsTab } from './vault-dialog-tabs/analytics-tab'
import { VaultHoldersTab } from './vault-dialog-tabs/holders-tab'
import { VaultTradeTab } from './vault-dialog-tabs/trade-tab'

interface VaultDetailDialogProps {
  vault: TributaryVault | null
  isOpen: boolean
  onClose: () => void
  onBuyTokens: (vault: TributaryVault) => void
}

export function VaultDetailDialog({ vault, isOpen, onClose, onBuyTokens }: VaultDetailDialogProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Handle escape key and body scroll lock
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = 'auto'
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onClose])

  // Handle outside click
  useOutsideClick(ref, onClose)

  if (!vault) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Dialog */}
          <div className="fixed inset-0 grid place-items-center z-50 p-4 overflow-y-auto">
            <motion.div
              ref={ref}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-[800px] max-h-[90vh] flex flex-col bg-river-900 border border-river-700 rounded-2xl overflow-hidden shadow-2xl my-4"
            >
              {/* Header with image and basic info */}
              <VaultDialogHeader vault={vault} onClose={onClose} />

              {/* Tabs */}
              <div className="flex-1 overflow-auto">
                <Tabs defaultValue="overview" className="p-6">
                  <TabsList className="grid w-full grid-cols-4 mb-6 bg-river-800/50">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:bg-tributary-600 data-[state=active]:text-white"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="analytics"
                      className="data-[state=active]:bg-tributary-600 data-[state=active]:text-white"
                    >
                      Analytics
                    </TabsTrigger>
                    <TabsTrigger
                      value="holders"
                      className="data-[state=active]:bg-tributary-600 data-[state=active]:text-white"
                    >
                      Holders
                    </TabsTrigger>
                    <TabsTrigger
                      value="trade"
                      className="data-[state=active]:bg-tributary-600 data-[state=active]:text-white"
                    >
                      Trade
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-0">
                    <VaultOverviewTab vault={vault} />
                  </TabsContent>
                  <TabsContent value="analytics" className="mt-0">
                    <VaultAnalyticsTab vault={vault} />
                  </TabsContent>
                  <TabsContent value="holders" className="mt-0">
                    <VaultHoldersTab vault={vault} />
                  </TabsContent>
                  <TabsContent value="trade" className="mt-0">
                    <VaultTradeTab vault={vault} />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Footer with CTA */}
              <div className="p-6 border-t border-river-700 bg-river-800/30">
                <Button
                  onClick={() => onBuyTokens(vault)}
                  className="w-full bg-gradient-to-r from-tributary-500 to-tributary-600 hover:from-tributary-600 hover:to-tributary-700 text-white font-semibold"
                  size="lg"
                >
                  Buy {vault.tokenSymbol} Tokens
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
