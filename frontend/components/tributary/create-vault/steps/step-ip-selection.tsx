'use client'

import { useState } from 'react'
import { Search, FileAudio, Image, Code, AlertCircle, Check, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { UseCreateVaultReturn, StoryIPAsset } from '../types'

interface StepIPSelectionProps {
  form: UseCreateVaultReturn
}

// Get icon based on media type
function getIPIcon(mediaType?: string) {
  if (mediaType?.startsWith('audio')) return FileAudio
  if (mediaType?.startsWith('image')) return Image
  return Code
}

function IPAssetCard({
  asset,
  isSelected,
  onSelect,
  disabled
}: {
  asset: StoryIPAsset
  isSelected: boolean
  onSelect: () => void
  disabled?: boolean
}) {
  const Icon = getIPIcon(asset.metadata?.mediaType)

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'relative p-4 rounded-xl border transition-all text-left w-full',
        'bg-gradient-to-b from-river-800/80 to-river-900/90',
        'hover:border-tributary-500/50 hover:shadow-[0_0_30px_rgba(20,184,166,0.15)]',
        isSelected && 'border-tributary-500 shadow-[0_0_30px_rgba(20,184,166,0.2)]',
        !isSelected && 'border-river-700/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-tributary-500 flex items-center justify-center">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* IP Image/Icon */}
        <div className="w-16 h-16 rounded-lg bg-river-700/50 flex items-center justify-center overflow-hidden flex-shrink-0">
          {asset.metadata?.image ? (
            <img
              src={asset.metadata.image}
              alt={asset.metadata.name || 'IP Asset'}
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon className="h-8 w-8 text-slate-400" />
          )}
        </div>

        {/* IP Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-100 truncate">
            {asset.metadata?.name || `IP #${asset.tokenId}`}
          </h4>
          <p className="text-sm text-slate-400 line-clamp-2 mt-1">
            {asset.metadata?.description || 'No description'}
          </p>
          <p className="text-xs text-slate-500 mt-2 font-mono">
            Token #{asset.tokenId}
          </p>
        </div>
      </div>
    </button>
  )
}

export function StepIPSelection({ form }: StepIPSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAssets = form.userIPAssets.filter(asset => {
    if (!searchQuery) return true
    const name = asset.metadata?.name?.toLowerCase() || ''
    const desc = asset.metadata?.description?.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    return name.includes(query) || desc.includes(query)
  })

  if (form.isLoadingIPs) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 text-tributary-500 animate-spin" />
        <p className="text-slate-400">Loading your IP assets...</p>
      </div>
    )
  }

  if (form.userIPAssets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-river-800 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-slate-400" />
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-100">No IP Assets Found</h4>
          <p className="text-sm text-slate-400 max-w-sm">
            You need to register intellectual property on Story Protocol before creating a royalty vault.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-100">Select IP Asset</h3>
        <p className="text-sm text-slate-400">
          Choose the intellectual property you want to tokenize royalties for.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your IP assets..."
          className="pl-10 bg-river-900/50 border-slate-700 focus:border-tributary-500"
        />
      </div>

      {/* Already has vault warning */}
      {form.ipAlreadyHasVault && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-200">
            This IP already has a royalty vault. Select a different asset.
          </p>
        </div>
      )}

      {/* IP Asset Grid */}
      <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-1">
        {filteredAssets.map((asset) => (
          <IPAssetCard
            key={asset.id}
            asset={asset}
            isSelected={form.formData.selectedIP?.id === asset.id}
            onSelect={() => form.setSelectedIP(asset)}
          />
        ))}
      </div>

      {/* No results */}
      {filteredAssets.length === 0 && searchQuery && (
        <p className="text-center text-slate-400 py-4">
          No IP assets match &quot;{searchQuery}&quot;
        </p>
      )}
    </div>
  )
}
