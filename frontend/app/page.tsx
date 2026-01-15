'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatUnits } from 'viem'
import { Vault } from 'lucide-react'
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
  const tradeFee = parseInt(vault.tradingFeeBps) / 100
  const displayName = vault.ipName || vault.token.name

  return (
    <Link href={`/vault/${vault.id}`}>
      <div className="h-full flex flex-col hover:bg-muted/30 transition-all cursor-pointer group">
        {/* Image Section - 70% of card height */}
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          {vault.imageUrl ? (
            <Image
              src={vault.imageUrl}
              alt={displayName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/20">
              <Vault className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="mb-3">
            <h3 className="font-title text-2xl text-foreground group-hover:text-primary transition-colors truncate">
              {displayName}
            </h3>
            <p className="font-body text-xs text-muted-foreground">
              ${vault.token.symbol.toUpperCase()} • {formatAddress(vault.creator)}
            </p>
          </div>

          {/* Stats Row: TVL | Dividend | Fee */}
          <div className="flex items-center justify-between text-center mt-auto">
            <div>
              <p className="font-stat text-lg">${formatNumber(totalDeposited)}</p>
              <p className="font-body text-[10px] text-muted-foreground">TVL</p>
            </div>
            <div className="h-8 w-px bg-muted" />
            <div>
              <p className="font-stat text-lg text-primary">{dividendRate.toFixed(1)}%</p>
              <p className="font-body text-[10px] text-muted-foreground">DIVIDEND</p>
            </div>
            <div className="h-8 w-px bg-muted" />
            <div>
              <p className="font-stat text-lg">{tradeFee.toFixed(1)}%</p>
              <p className="font-body text-[10px] text-muted-foreground">FEE</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
