'use client'

import { useState, useEffect } from 'react'
import { History, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PriceDisplay } from '../shared/price-display'
import type { UsageReceipt } from '../../types'

interface UsageHistoryProps {
  listingId: string
  usages?: UsageReceipt[]
  isLoading?: boolean
}

export function UsageHistory({ listingId, usages = [], isLoading = false }: UsageHistoryProps) {
  const truncateAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Usage History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Usage History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {usages.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No usage records yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Tx</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usages.map((usage) => (
                <TableRow key={usage.id}>
                  <TableCell className="font-mono text-sm">
                    {truncateAddress(usage.user)}
                  </TableCell>
                  <TableCell>
                    <PriceDisplay amount={usage.amount} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(usage.timestamp)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        window.open(
                          `https://testnet.snowtrace.io/tx/${usage.paymentTxHash}`,
                          '_blank'
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export default UsageHistory
