'use client'

import { useMemo } from 'react'
import { FileAudio, Coins, DollarSign, Users, PieChart, Check, AlertTriangle, Wallet } from 'lucide-react'
import { useAccount } from '@/lib/web3'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { UseCreateVaultReturn } from '../types'

interface StepReviewProps {
  form: UseCreateVaultReturn
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

function formatDate(date?: Date): string {
  if (!date) return 'Not set'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

interface ReviewSectionProps {
  title: string
  icon: React.ReactNode
  items: Array<{ label: string; value: string | React.ReactNode }>
  onEdit?: () => void
}

function ReviewSection({ title, icon, items, onEdit }: ReviewSectionProps) {
  return (
    <div className="p-4 rounded-lg bg-river-800/50 border border-slate-700/50 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">{icon}<h4 className="font-medium text-slate-100">{title}</h4></div>
        {onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit} className="text-xs text-tributary-400 hover:text-tributary-300">Edit</Button>
        )}
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-slate-400">{item.label}</span>
            <span className="text-sm font-medium text-slate-100">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function StepReview({ form }: StepReviewProps) {
  const { formData, goToStep } = form
  const { address, isConnected } = useAccount()

  const distribution = useMemo(() => {
    const total = parseFloat(formData.totalSupply) || 0
    const creatorPct = parseFloat(formData.creatorAllocation) || 0
    const creatorAmount = Math.floor(total * (creatorPct / 100))
    const saleAmount = total - creatorAmount
    const saleCap = parseFloat(formData.saleCap) || 0
    const pricePerToken = parseFloat(formData.pricePerToken) || 0
    const tokensForSale = formData.saleEnabled ? Math.min(saleCap, saleAmount) : 0
    const potentialRaise = tokensForSale * pricePerToken
    return { creatorAmount, creatorPct, saleAmount, tokensForSale, potentialRaise, fdv: total * pricePerToken }
  }, [formData])

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-100">Review & Create</h3>
        <p className="text-sm text-slate-400">Review your vault configuration before creating. This action is irreversible.</p>
      </div>

      <ReviewSection
        title="IP Asset"
        icon={<FileAudio className="h-4 w-4 text-tributary-400" />}
        onEdit={() => goToStep('ip-selection')}
        items={[
          { label: 'Name', value: formData.selectedIP?.metadata?.name || `IP #${formData.selectedIP?.tokenId}` },
          { label: 'Token ID', value: `#${formData.selectedIP?.tokenId}` },
          { label: 'Contract', value: formData.selectedIP ? truncateAddress(formData.selectedIP.id) : '-' },
        ]}
      />

      <ReviewSection
        title="Token Configuration"
        icon={<Coins className="h-4 w-4 text-cyan-400" />}
        onEdit={() => goToStep('token-config')}
        items={[
          { label: 'Token Name', value: formData.tokenName },
          { label: 'Symbol', value: formData.tokenSymbol },
          { label: 'Total Supply', value: parseInt(formData.totalSupply).toLocaleString() },
        ]}
      />

      <div className="p-4 rounded-lg bg-gradient-to-b from-tributary-500/10 to-cyan-500/5 border border-tributary-500/30 space-y-4">
        <div className="flex items-center gap-2"><PieChart className="h-4 w-4 text-tributary-400" /><h4 className="font-medium text-slate-100">Token Distribution</h4></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-river-900/50">
            <div className="flex items-center gap-2 mb-2"><Wallet className="h-4 w-4 text-tributary-400" /><span className="text-xs text-slate-400">Creator (You)</span></div>
            <p className="text-lg font-semibold font-mono text-tributary-400">{distribution.creatorAmount.toLocaleString()}</p>
            <p className="text-xs text-slate-500">{distribution.creatorPct}%</p>
          </div>
          <div className="p-3 rounded-lg bg-river-900/50">
            <div className="flex items-center gap-2 mb-2"><Users className="h-4 w-4 text-cyan-400" /><span className="text-xs text-slate-400">For Sale</span></div>
            <p className="text-lg font-semibold font-mono text-cyan-400">{distribution.tokensForSale.toLocaleString()}</p>
            <p className="text-xs text-slate-500">{formData.saleEnabled ? `${100 - distribution.creatorPct}%` : 'Disabled'}</p>
          </div>
        </div>
      </div>

      {formData.saleEnabled && (
        <ReviewSection
          title="Sale Terms"
          icon={<DollarSign className="h-4 w-4 text-green-400" />}
          onEdit={() => goToStep('sale-config')}
          items={[
            { label: 'Price per Token', value: formatUSD(parseFloat(formData.pricePerToken)) },
            { label: 'Maximum Raise', value: <span className="text-green-400">{formatUSD(distribution.potentialRaise)}</span> },
            { label: 'Fully Diluted Value', value: formatUSD(distribution.fdv) },
            { label: 'Sale Period', value: formData.startTime ? `${formatDate(formData.startTime)} - ${formatDate(formData.endTime)}` : 'Immediate' },
          ]}
        />
      )}

      <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
        <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-200">
          <p className="font-medium mb-1">This action is irreversible</p>
          <p>Once created, the vault's token supply and creator allocation cannot be changed. Sale terms can be modified later.</p>
        </div>
      </div>

      {!isConnected && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-river-800/50 border border-slate-700/50">
          <Wallet className="h-5 w-5 text-slate-400" />
          <p className="text-sm text-slate-400">Connect your wallet to create the vault</p>
        </div>
      )}

      {isConnected && address && (
        <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
          <Check className="h-3 w-3 text-green-500" />
          <span>Connected as {truncateAddress(address)}</span>
        </div>
      )}
    </div>
  )
}
