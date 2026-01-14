'use client'

import { useMemo } from 'react'
import { DollarSign, Calendar, Lock, Unlock, AlertCircle, Calculator } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { UseCreateVaultReturn } from '../types'

interface StepSaleConfigProps {
  form: UseCreateVaultReturn
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDateForInput(date?: Date): string {
  if (!date) return ''
  return date.toISOString().slice(0, 16)
}

export function StepSaleConfig({ form }: StepSaleConfigProps) {
  const { formData, updateSaleConfig } = form

  const projections = useMemo(() => {
    const totalSupply = parseFloat(formData.totalSupply) || 0
    const creatorAlloc = parseFloat(formData.creatorAllocation) || 0
    const saleTokens = totalSupply * ((100 - creatorAlloc) / 100)
    const saleCap = parseFloat(formData.saleCap) || 0
    const pricePerToken = parseFloat(formData.pricePerToken) || 0
    const tokensForSale = Math.min(saleCap, saleTokens)
    const potentialRaise = tokensForSale * pricePerToken
    const fullyDilutedValue = totalSupply * pricePerToken
    return {
      saleTokens, tokensForSale, potentialRaise, fullyDilutedValue,
      percentOfSupply: ((tokensForSale / totalSupply) * 100).toFixed(1),
    }
  }, [formData])

  const validations = useMemo(() => ({
    priceValid: parseFloat(formData.pricePerToken) > 0,
    capValid: parseFloat(formData.saleCap) > 0 && parseFloat(formData.saleCap) <= projections.saleTokens,
    datesValid: !formData.startTime || !formData.endTime || formData.endTime > formData.startTime,
  }), [formData, projections.saleTokens])

  const saleCapPresets = useMemo(() => {
    const max = projections.saleTokens
    return [
      { label: '25%', value: Math.floor(max * 0.25) },
      { label: '50%', value: Math.floor(max * 0.5) },
      { label: '75%', value: Math.floor(max * 0.75) },
      { label: 'Max', value: max },
    ]
  }, [projections.saleTokens])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-100">Sale Configuration</h3>
        <p className="text-sm text-slate-400">Configure how investors can purchase your royalty tokens.</p>
      </div>

      {/* Enable Sale Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-river-800/50 border border-slate-700/50">
        <div className="flex items-center gap-3">
          {formData.saleEnabled ? <Unlock className="h-5 w-5 text-tributary-500" /> : <Lock className="h-5 w-5 text-slate-500" />}
          <div>
            <Label htmlFor="saleEnabled" className="text-slate-100">Enable Token Sale</Label>
            <p className="text-xs text-slate-400 mt-0.5">
              {formData.saleEnabled ? 'Investors can purchase tokens immediately' : 'Tokens will only be distributed to you'}
            </p>
          </div>
        </div>
        <Switch
          id="saleEnabled"
          checked={formData.saleEnabled}
          onCheckedChange={(checked) => updateSaleConfig('saleEnabled', checked)}
          className="data-[state=checked]:bg-tributary-500"
        />
      </div>

      {formData.saleEnabled && (
        <>
          {/* Price Per Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="pricePerToken">Price Per Token</Label>
              <span className="text-xs text-slate-500">in USDC</span>
            </div>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                id="pricePerToken"
                type="number"
                step="0.001"
                min="0"
                value={formData.pricePerToken}
                onChange={(e) => updateSaleConfig('pricePerToken', e.target.value)}
                placeholder="0.01"
                className={cn('pl-10 bg-river-900/50 border-slate-700 font-mono', !validations.priceValid && formData.pricePerToken && 'border-red-500/50')}
              />
            </div>
            {!validations.priceValid && formData.pricePerToken && <p className="text-xs text-red-400">Price must be greater than 0</p>}
          </div>

          {/* Sale Cap */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="saleCap">Sale Cap</Label>
              <span className="text-xs text-slate-500">Max: {projections.saleTokens.toLocaleString()} tokens</span>
            </div>
            <Input
              id="saleCap"
              type="number"
              min="1"
              max={projections.saleTokens}
              value={formData.saleCap}
              onChange={(e) => updateSaleConfig('saleCap', e.target.value)}
              placeholder="800000"
              className={cn('bg-river-900/50 border-slate-700 font-mono', !validations.capValid && formData.saleCap && 'border-red-500/50')}
            />
            <div className="flex gap-2">
              {saleCapPresets.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateSaleConfig('saleCap', preset.value.toString())}
                  className={cn(
                    'flex-1 border-slate-700 hover:border-tributary-500 hover:text-tributary-400',
                    formData.saleCap === preset.value.toString() && 'border-tributary-500 text-tributary-400'
                  )}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Sale Timeframe */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              Sale Timeframe (Optional)
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="startTime" className="text-xs text-slate-400">Start Date</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formatDateForInput(formData.startTime)}
                  onChange={(e) => updateSaleConfig('startTime', e.target.value ? new Date(e.target.value) : undefined)}
                  className="bg-river-900/50 border-slate-700 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endTime" className="text-xs text-slate-400">End Date</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formatDateForInput(formData.endTime)}
                  onChange={(e) => updateSaleConfig('endTime', e.target.value ? new Date(e.target.value) : undefined)}
                  className="bg-river-900/50 border-slate-700 text-sm"
                />
              </div>
            </div>
            {!validations.datesValid && <p className="text-xs text-red-400">End date must be after start date</p>}
          </div>

          {/* Projections Card */}
          <div className="p-4 rounded-lg bg-gradient-to-b from-tributary-500/10 to-cyan-500/5 border border-tributary-500/30 space-y-4">
            <div className="flex items-center gap-2 text-tributary-400">
              <Calculator className="h-4 w-4" />
              <span className="text-sm font-medium">Sale Projections</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Tokens for Sale</p>
                <p className="text-lg font-semibold font-mono text-slate-100">{projections.tokensForSale.toLocaleString()}</p>
                <p className="text-xs text-slate-500">{projections.percentOfSupply}% of supply</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Max Raise</p>
                <p className="text-lg font-semibold font-mono text-green-400">{formatUSD(projections.potentialRaise)}</p>
                <p className="text-xs text-slate-500">if fully sold</p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-700/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Fully Diluted Valuation</span>
                <span className="text-sm font-mono text-slate-100">{formatUSD(projections.fullyDilutedValue)}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* No Sale Info */}
      {!formData.saleEnabled && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-river-800/50 border border-slate-700/50">
          <AlertCircle className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-slate-400 space-y-2">
            <p>With sale disabled, all tokens will be allocated to you. You can still:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Receive 100% of royalty distributions</li>
              <li>Enable sales later through the marketplace</li>
              <li>Transfer tokens to investors manually</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
