'use client'

import { useState } from 'react'
import { Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatUSDC } from '@/lib/utils'
import { ClaimAllDialog } from './claim-all-dialog'
import type { PortfolioHolding } from '../types'

interface ClaimAllButtonProps {
  pendingRewards: bigint
  holdings: PortfolioHolding[]
  onSuccess?: () => void
}

export function ClaimAllButton({ pendingRewards, holdings, onSuccess }: ClaimAllButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const hasRewards = pendingRewards > 0n
  const holdingsWithRewards = holdings.filter((h) => h.pendingRewards > 0n)

  if (!hasRewards) {
    return (
      <Button disabled variant="outline" size="lg">
        <Gift className="h-4 w-4 mr-2" />
        No Rewards to Claim
      </Button>
    )
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="bg-gradient-to-r from-tributary-500 to-cyan-600 hover:from-tributary-600 hover:to-cyan-700"
      >
        <Gift className="h-4 w-4 mr-2" />
        Claim All ({formatUSDC(pendingRewards)})
      </Button>

      <ClaimAllDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        holdings={holdingsWithRewards}
        totalRewards={pendingRewards}
        onSuccess={() => {
          setIsOpen(false)
          onSuccess?.()
        }}
      />
    </>
  )
}
