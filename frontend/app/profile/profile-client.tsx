'use client'

import { useAccount, ConnectButton } from '@/lib/web3'
import { useUserIPs } from '@/hooks/use-user-ips'
import { useUserHoldings } from '@/hooks/use-user-holdings'
import { useUserVaults } from '@/hooks/use-user-vaults'
import { IPCard } from '@/components/profile/ip-card'
import { HoldingRow } from '@/components/profile/holding-row'
import { ManagedVaultRow } from '@/components/profile/managed-vault-row'
import { PortfolioStats } from '@/components/profile/portfolio-stats'
import { formatNumber, shortenAddress } from '@/lib/utils'
import Link from 'next/link'

export default function ProfileClient() {
  const { address, isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="container mx-auto px-6 py-24 text-center">
        <h1 className="font-title text-6xl mb-6">Profile</h1>
        <p className="font-body text-text-secondary mb-8">
          CONNECT YOUR WALLET TO VIEW YOUR PROFILE
        </p>
        <ConnectButton />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-title text-6xl mb-2">Profile</h1>
          <p className="font-body text-text-secondary">
            {shortenAddress(address!)}
          </p>
        </div>
      </div>
      <PortfolioStats address={address!} />
      <MyIPsSection address={address!} />
      <MyHoldingsSection address={address!} />
      <MyVaultsSection address={address!} />
    </div>
  )
}

function MyIPsSection({ address }: { address: string }) {
  const { data: ips, isLoading } = useUserIPs(address)

  return (
    <section className="mb-16">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-title text-4xl mb-1">My IPs</h2>
          <p className="font-body text-xs text-text-secondary">
            YOUR STORY PROTOCOL INTELLECTUAL PROPERTIES
          </p>
        </div>
        <Link href="/create" className="btn-primary">
          CREATE VAULT
        </Link>
      </div>
      <div className="divider border-t border-cream-dark mb-6" />
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-premium p-6 animate-pulse">
              <div className="h-20 bg-cream-dark rounded" />
            </div>
          ))}
        </div>
      ) : ips?.length === 0 ? (
        <div className="card-premium p-8 text-center">
          <p className="font-body text-text-secondary mb-4">
            NO IPS FOUND ON STORY PROTOCOL
          </p>
          <a
            href="https://app.story.foundation"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-tributary hover:text-tributary-light"
          >
            REGISTER YOUR IP →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ips?.map((ip) => (
            <IPCard key={ip.id} ip={ip} />
          ))}
        </div>
      )}
    </section>
  )
}

function MyHoldingsSection({ address }: { address: string }) {
  const { data: holdings, isLoading } = useUserHoldings(address)
  const totalPending = holdings?.reduce(
    (sum, h) => sum + parseFloat(h.pendingRewards || '0'),
    0
  ) || 0

  return (
    <section className="mb-16">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-title text-4xl mb-1">My Holdings</h2>
          <p className="font-body text-xs text-text-secondary">
            ROYALTY TOKENS YOU OWN
          </p>
        </div>
        {totalPending > 0 && (
          <button className="btn-primary">
            CLAIM ALL (${formatNumber(totalPending)})
          </button>
        )}
      </div>
      <div className="divider border-t border-cream-dark mb-6" />
      {isLoading ? (
        <div className="card-premium">
          <div className="animate-pulse p-6">
            <div className="h-12 bg-cream-dark rounded mb-4" />
            <div className="h-12 bg-cream-dark rounded mb-4" />
            <div className="h-12 bg-cream-dark rounded" />
          </div>
        </div>
      ) : holdings?.length === 0 ? (
        <div className="card-premium p-8 text-center">
          <p className="font-body text-text-secondary mb-4">
            YOU DON&apos;T OWN ANY ROYALTY TOKENS YET
          </p>
          <Link href="/marketplace" className="btn-secondary">
            BROWSE MARKETPLACE
          </Link>
        </div>
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="grid grid-cols-6 gap-4 p-4 bg-cream-dark/50 font-body text-xs text-text-muted">
            <div className="col-span-2">TOKEN</div>
            <div className="text-right">BALANCE</div>
            <div className="text-right">VALUE</div>
            <div className="text-right">PENDING</div>
            <div className="text-right">ACTIONS</div>
          </div>
          {holdings?.map((holding) => (
            <HoldingRow key={holding.id} holding={holding} />
          ))}
        </div>
      )}
    </section>
  )
}

function MyVaultsSection({ address }: { address: string }) {
  const { data: vaults, isLoading } = useUserVaults(address)

  return (
    <section>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-title text-4xl mb-1">My Vaults</h2>
          <p className="font-body text-xs text-text-secondary">
            VAULTS YOU CREATED
          </p>
        </div>
      </div>
      <div className="divider border-t border-cream-dark mb-6" />
      {isLoading ? (
        <div className="card-premium animate-pulse p-6">
          <div className="h-16 bg-cream-dark rounded" />
        </div>
      ) : vaults?.length === 0 ? (
        <div className="card-premium p-8 text-center">
          <p className="font-body text-text-secondary">
            YOU HAVEN&apos;T CREATED ANY VAULTS YET
          </p>
        </div>
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="grid grid-cols-6 gap-4 p-4 bg-cream-dark/50 font-body text-xs text-text-muted">
            <div className="col-span-2">VAULT</div>
            <div className="text-right">REVENUE</div>
            <div className="text-right">DISTRIBUTED</div>
            <div className="text-right">PENDING</div>
            <div className="text-right">ACTIONS</div>
          </div>
          {vaults?.map((vault) => (
            <ManagedVaultRow key={vault.id} vault={vault} />
          ))}
        </div>
      )}
    </section>
  )
}
