'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Tag, Gift, ArrowDownCircle, Filter, ExternalLink, Calendar, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { formatUSDC, formatTokenAmount } from '@/lib/utils'
import { useInvestmentHistory } from '../hooks/use-investment-history'
import type { Address } from 'viem'
import type { InvestmentEvent } from '../types'

type EventFilter = 'all' | 'buy' | 'sell' | 'claim' | 'distribution'

interface InvestmentHistoryProps {
  address: Address | undefined
}

export function InvestmentHistory({ address }: InvestmentHistoryProps) {
  const [filter, setFilter] = useState<EventFilter>('all')
  const { events, isLoading, hasMore, loadMore } = useInvestmentHistory(address)

  const filteredEvents = useMemo(() => {
    return events.filter((event) => filter === 'all' || event.type === filter)
  }, [events, filter])

  const groupedEvents = useMemo(() => {
    const groups: Map<string, InvestmentEvent[]> = new Map()
    filteredEvents.forEach((event) => {
      const date = new Date(event.timestamp * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      const existing = groups.get(date) || []
      groups.set(date, [...existing, event])
    })
    return groups
  }, [filteredEvents])

  if (isLoading && events.length === 0) return <HistorySkeleton />

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex flex-wrap gap-3">
        <Select value={filter} onValueChange={(v) => setFilter(v as EventFilter)}>
          <SelectTrigger className="w-40 bg-river-800/50">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="buy">Purchases</SelectItem>
            <SelectItem value="sell">Sales</SelectItem>
            <SelectItem value="claim">Claims</SelectItem>
            <SelectItem value="distribution">Distributions</SelectItem>
          </SelectContent>
        </Select>
        {filter !== 'all' && (
          <Button variant="ghost" size="sm" onClick={() => setFilter('all')}>
            Clear Filter
          </Button>
        )}
      </div>

      {/* Timeline */}
      {filteredEvents.length === 0 ? (
        <EmptyHistory />
      ) : (
        <div className="space-y-8">
          {Array.from(groupedEvents.entries()).map(([date, dayEvents]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-river-400 mb-4">{date}</h3>
              <div className="space-y-3">
                {dayEvents.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
          {hasMore && (
            <Button variant="outline" className="w-full" onClick={loadMore} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Load More'}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

const eventConfig = {
  buy: { icon: ShoppingCart, label: 'Bought Tokens', color: 'text-blue-400', bgColor: 'bg-blue-500/10', valueColor: 'text-red-400' },
  sell: { icon: Tag, label: 'Sold Tokens', color: 'text-orange-400', bgColor: 'bg-orange-500/10', valueColor: 'text-green-400' },
  claim: { icon: Gift, label: 'Claimed Rewards', color: 'text-tributary-400', bgColor: 'bg-tributary-500/10', valueColor: 'text-green-400' },
  distribution: { icon: ArrowDownCircle, label: 'Received Distribution', color: 'text-purple-400', bgColor: 'bg-purple-500/10', valueColor: 'text-green-400' },
}

function EventCard({ event }: { event: InvestmentEvent }) {
  const config = eventConfig[event.type]
  const formatTime = (ts: number) => new Date(ts * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex items-center gap-4 p-4 bg-river-800/30 rounded-xl border border-river-700">
      <div className={`p-2 rounded-lg ${config.bgColor}`}>
        <config.icon className={`h-5 w-5 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{config.label}</span>
          <Badge variant="secondary" className="text-xs">{event.tokenSymbol}</Badge>
        </div>
        <p className="text-sm text-river-400 truncate">{formatTokenAmount(event.amount)} tokens</p>
      </div>
      <div className="text-right">
        <p className={`font-mono font-medium ${config.valueColor}`}>
          {event.type === 'buy' ? '-' : '+'}{formatUSDC(event.value)}
        </p>
        <p className="text-xs text-river-500">{formatTime(event.timestamp)}</p>
      </div>
      <a
        href={`https://aeneid.storyscan.xyz/tx/${event.txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 hover:bg-river-700/50 rounded-lg transition-colors"
      >
        <ExternalLink className="h-4 w-4 text-river-500" />
      </a>
    </div>
  )
}

function EmptyHistory() {
  return (
    <div className="text-center py-12">
      <Calendar className="h-12 w-12 text-river-600 mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No History Yet</h3>
      <p className="text-river-500 text-sm">Your investment activity will appear here</p>
    </div>
  )
}

function HistorySkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-3"><Skeleton className="h-10 w-40" /></div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (<Skeleton key={i} className="h-20 w-full rounded-xl" />))}
      </div>
    </div>
  )
}
