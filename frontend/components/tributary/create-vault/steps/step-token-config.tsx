'use client'

import { useMemo } from 'react'
import { Coins, PieChart, Info, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { UseCreateVaultReturn } from '../types'

interface StepTokenConfigProps {
  form: UseCreateVaultReturn
}

function formatNumber(value: string): string {
  const num = parseInt(value.replace(/,/g, ''), 10)
  return isNaN(num) ? value : num.toLocaleString()
}

function parseNumber(value: string): string {
  return value.replace(/,/g, '')
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger><Info className="h-4 w-4 text-slate-500" /></TooltipTrigger>
        <TooltipContent><p>{text}</p></TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function StepTokenConfig({ form }: StepTokenConfigProps) {
  const { formData, updateTokenConfig } = form

  const distribution = useMemo(() => {
    const total = parseFloat(formData.totalSupply) || 0
    const creatorPct = parseFloat(formData.creatorAllocation) || 0
    const creatorAmount = Math.floor(total * (creatorPct / 100))
    return { creatorAmount, creatorPct, saleAmount: total - creatorAmount, salePct: 100 - creatorPct }
  }, [formData.totalSupply, formData.creatorAllocation])

  const validations = useMemo(() => ({
    nameValid: formData.tokenName.length >= 3 && formData.tokenName.length <= 32,
    symbolValid: /^[A-Z0-9-]{3,10}$/.test(formData.tokenSymbol),
    supplyValid: parseFloat(formData.totalSupply) >= 1000,
  }), [formData.tokenName, formData.tokenSymbol, formData.totalSupply])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-100">Token Configuration</h3>
        <p className="text-sm text-slate-400">
          Configure your royalty token parameters. These cannot be changed after vault creation.
        </p>
      </div>

      {formData.selectedIP && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-river-800/50 border border-slate-700/50">
          <div className="w-10 h-10 rounded-lg bg-river-800 flex items-center justify-center overflow-hidden">
            {formData.selectedIP.metadata?.image ? (
              <img src={formData.selectedIP.metadata.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <Coins className="h-5 w-5 text-slate-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-100 truncate">
              {formData.selectedIP.metadata?.name || `IP #${formData.selectedIP.tokenId}`}
            </p>
            <p className="text-xs text-slate-500 font-mono">
              {formData.selectedIP.id.slice(0, 10)}...{formData.selectedIP.id.slice(-8)}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="tokenName">Token Name</Label>
          <InfoTooltip text="The full name of your royalty token (3-32 characters)" />
        </div>
        <Input
          id="tokenName"
          value={formData.tokenName}
          onChange={(e) => updateTokenConfig('tokenName', e.target.value)}
          placeholder="e.g., Summer Vibes Royalty"
          className={cn('bg-river-900/50 border-slate-700', !validations.nameValid && formData.tokenName && 'border-red-500/50')}
          maxLength={32}
        />
        {!validations.nameValid && formData.tokenName && <p className="text-xs text-red-400">Name must be 3-32 characters</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="tokenSymbol">Token Symbol</Label>
          <InfoTooltip text="3-10 uppercase letters, numbers, or hyphens" />
        </div>
        <Input
          id="tokenSymbol"
          value={formData.tokenSymbol}
          onChange={(e) => updateTokenConfig('tokenSymbol', e.target.value.toUpperCase())}
          placeholder="e.g., VIBE-ROY"
          className={cn('bg-river-900/50 border-slate-700 uppercase', !validations.symbolValid && formData.tokenSymbol && 'border-red-500/50')}
          maxLength={10}
        />
        {!validations.symbolValid && formData.tokenSymbol && <p className="text-xs text-red-400">Symbol must be 3-10 uppercase characters</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="totalSupply">Total Supply</Label>
          <span className="text-xs text-slate-500">{formatNumber(formData.totalSupply)} tokens</span>
        </div>
        <Input
          id="totalSupply"
          value={formatNumber(formData.totalSupply)}
          onChange={(e) => updateTokenConfig('totalSupply', parseNumber(e.target.value))}
          placeholder="1,000,000"
          className={cn('bg-river-900/50 border-slate-700 font-mono', !validations.supplyValid && formData.totalSupply && 'border-red-500/50')}
        />
        {!validations.supplyValid && formData.totalSupply && <p className="text-xs text-red-400">Minimum supply is 1,000 tokens</p>}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Creator Allocation</Label>
          <span className="text-sm font-semibold text-tributary-400">{distribution.creatorPct}%</span>
        </div>
        <Slider
          value={[distribution.creatorPct]}
          onValueChange={([value]) => updateTokenConfig('creatorAllocation', value.toString())}
          min={0} max={100} step={1}
          className="[&>[role=slider]]:bg-tributary-500 [&>.relative]:bg-slate-700"
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-tributary-500/10 border border-tributary-500/30">
            <div className="flex items-center gap-2 mb-1">
              <PieChart className="h-4 w-4 text-tributary-400" />
              <span className="text-xs text-slate-400">Creator Keeps</span>
            </div>
            <p className="text-lg font-semibold font-mono text-tributary-400">{distribution.creatorAmount.toLocaleString()}</p>
            <p className="text-xs text-slate-500">{distribution.creatorPct}% of supply</p>
          </div>
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Coins className="h-4 w-4 text-cyan-400" />
              <span className="text-xs text-slate-400">Available for Sale</span>
            </div>
            <p className="text-lg font-semibold font-mono text-cyan-400">{distribution.saleAmount.toLocaleString()}</p>
            <p className="text-xs text-slate-500">{distribution.salePct}% of supply</p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 p-3 rounded-lg bg-river-800/50 border border-slate-700/50">
        <AlertCircle className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-slate-400 space-y-1">
          <p><strong>Creator tokens</strong> are locked in your wallet and receive royalty distributions automatically.</p>
          <p><strong>Sale tokens</strong> can be sold to investors who will also receive proportional royalties.</p>
        </div>
      </div>
    </div>
  )
}
