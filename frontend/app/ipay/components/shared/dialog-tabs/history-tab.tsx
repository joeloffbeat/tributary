'use client'

import { Clock, Construction } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { IPAssetListing } from '../ip-asset-card'

interface HistoryTabProps {
  listing: IPAssetListing
}

export function HistoryTab({ listing }: HistoryTabProps) {
  // Placeholder for history tab - will be implemented later
  return (
    <div className="text-center py-8">
      <div className="relative inline-flex items-center justify-center">
        <Clock className="h-12 w-12 text-muted-foreground" />
        <Construction className="h-6 w-6 text-yellow-500 absolute -bottom-1 -right-1" />
      </div>
      <h4 className="text-lg font-medium mt-4 mb-2">Coming Soon</h4>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        Transaction history and usage tracking for this IP asset will be available soon.
      </p>

      {/* Placeholder stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 max-w-xs mx-auto">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{listing.usageCount}</p>
            <p className="text-xs text-muted-foreground">Total Uses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">-</p>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
