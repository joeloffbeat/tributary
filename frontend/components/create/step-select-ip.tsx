'use client'

import { useAccount } from '@/lib/web3'
import { useUserIPs } from '@/hooks/use-user-ips'
import { VaultFormData } from '@/app/create/page'

interface StepSelectIPProps {
  data: Partial<VaultFormData>
  onUpdate: (data: Partial<VaultFormData>) => void
  onNext: () => void
}

export function StepSelectIP({ data, onUpdate, onNext }: StepSelectIPProps) {
  const { address } = useAccount()
  const { data: ips, isLoading } = useUserIPs(address!)

  const availableIPs = ips?.filter((ip) => !ip.hasVault) || []

  const handleSelect = (ip: { id: string; name: string }) => {
    onUpdate({
      storyIPId: ip.id,
      ipName: ip.name,
      tokenName: `${ip.name} Token`,
      tokenSymbol: ip.name.slice(0, 4).toUpperCase(),
    })
  }

  return (
    <div>
      <h2 className="font-title text-3xl mb-2">Select Your IP</h2>
      <p className="font-body text-sm text-text-secondary mb-6">
        CHOOSE WHICH INTELLECTUAL PROPERTY TO TOKENIZE
      </p>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-cream-dark rounded animate-pulse" />
          ))}
        </div>
      ) : availableIPs.length === 0 ? (
        <div className="text-center py-8">
          <p className="font-body text-text-secondary mb-4">
            NO AVAILABLE IPS FOUND
          </p>
          <a
            href="https://app.story.foundation"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            REGISTER IP ON STORY →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {availableIPs.map((ip) => (
            <button
              key={ip.id}
              onClick={() => handleSelect(ip)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                data.storyIPId === ip.id
                  ? 'border-tributary bg-tributary/5'
                  : 'border-cream-dark hover:border-tributary/50'
              }`}
            >
              <p className="font-title text-xl">{ip.name}</p>
              <p className="font-body text-xs text-text-muted">{ip.type}</p>
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-end mt-8">
        <button
          onClick={onNext}
          disabled={!data.storyIPId}
          className="btn-primary disabled:opacity-50"
        >
          CONTINUE
        </button>
      </div>
    </div>
  )
}
