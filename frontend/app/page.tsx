'use client'

import Link from 'next/link'
import { formatUnits } from 'viem'
import { useProtocolStats } from '@/hooks/use-protocol-stats'
import { useFeaturedVaults, FeaturedVault } from '@/hooks/use-featured-vaults'
import { formatNumber, formatAddress } from '@/lib/utils'

export default function HomePage() {
  const { data: stats } = useProtocolStats()
  const { data: featured } = useFeaturedVaults(6)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 text-center">
        <h1 className="font-title text-7xl md:text-8xl text-primary mb-6">
          Tributary
        </h1>
        <p className="font-body text-muted-foreground max-w-xl mx-auto mb-12">
          TOKENIZE YOUR INTELLECTUAL PROPERTY.
          <br />
          SHARE YOUR SUCCESS WITH THE WORLD.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/marketplace" className="btn-primary">
            EXPLORE MARKETPLACE
          </Link>
          <Link href="/create" className="btn-secondary">
            CREATE YOUR VAULT
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto px-6">
        <div className="border-t border-muted" />
      </div>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <StatCard
            label="TOTAL VALUE LOCKED"
            value={`$${formatNumber(stats?.totalValueLocked || 0)}`}
          />
          <StatCard
            label="ACTIVE VAULTS"
            value={stats?.totalVaults || '0'}
          />
          <StatCard
            label="DIVIDENDS DISTRIBUTED"
            value={`$${formatNumber(stats?.totalDistributed || 0)}`}
          />
          <StatCard
            label="TOTAL TRADING VOLUME"
            value={`$${formatNumber(stats?.totalVolume || 0)}`}
          />
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto px-6">
        <div className="border-t border-muted" />
      </div>

      {/* Featured Vaults */}
      <section className="container mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="font-title text-5xl text-foreground mb-2">
              Featured
            </h2>
            <p className="font-body text-muted-foreground">
              DISCOVER TOP PERFORMING IP VAULTS
            </p>
          </div>
          <Link
            href="/marketplace"
            className="font-body text-primary hover:text-secondary transition-colors"
          >
            VIEW ALL →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured?.map((vault) => (
            <FeaturedVaultCard key={vault.id} vault={vault} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-card py-20">
        <div className="container mx-auto px-6">
          <h2 className="font-title text-5xl text-center mb-16">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <StepCard
              number="01"
              title="Create"
              description="REGISTER YOUR IP ON STORY PROTOCOL AND CREATE A ROYALTY VAULT"
            />
            <StepCard
              number="02"
              title="Tokenize"
              description="SET YOUR DIVIDEND RATE AND LET INVESTORS BUY SHARES OF YOUR IP"
            />
            <StepCard
              number="03"
              title="Distribute"
              description="AS YOUR IP EARNS, DIVIDENDS ARE AUTOMATICALLY DISTRIBUTED TO HOLDERS"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24 text-center">
        <h2 className="font-title text-5xl mb-6">
          Ready to Begin?
        </h2>
        <p className="font-body text-muted-foreground mb-8">
          JOIN THE FUTURE OF IP MONETIZATION
        </p>
        <Link href="/create" className="btn-primary">
          CREATE YOUR VAULT
        </Link>
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="font-stat text-4xl text-primary mb-2">{value}</p>
      <p className="font-body text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <p className="font-stat text-6xl text-muted mb-4">{number}</p>
      <h3 className="font-title text-3xl text-primary mb-3">{title}</h3>
      <p className="font-body text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function FeaturedVaultCard({ vault }: { vault: FeaturedVault }) {
  const totalDeposited = parseFloat(formatUnits(BigInt(vault.totalDeposited || '0'), 6))
  const dividendRate = parseInt(vault.dividendBps) / 100

  return (
    <Link href={`/vault/${vault.id}`}>
      <div className="p-6 hover:bg-muted/30 transition-all duration-300 cursor-pointer group">
        <div className="mb-4">
          <h3 className="font-title text-3xl text-foreground group-hover:text-primary transition-colors">
            {vault.token.name}
          </h3>
          <p className="font-body text-xs text-muted-foreground">
            {vault.token.symbol.toUpperCase()}
          </p>
        </div>

        <div className="divider border-t border-muted mb-4" />

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-body text-xs text-muted-foreground">TVL</span>
            <span className="font-stat text-foreground">
              ${formatNumber(totalDeposited)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-body text-xs text-muted-foreground">DIVIDEND</span>
            <span className="font-stat text-primary">{dividendRate}%</span>
          </div>
          <div className="pt-3 border-t border-muted">
            <p className="font-body text-xs text-muted-foreground">
              BY {formatAddress(vault.creator)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
