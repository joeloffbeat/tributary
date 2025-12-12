'use client'

import { LayoutDashboard, DollarSign, Zap, Package, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useAccount, ConnectButton } from '@/lib/web3'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useIPayAnalytics } from '../hooks/use-ipay-analytics'
import { PriceDisplay, formatPrice } from '../components/shared/price-display'
import { IPAssetCard, IPAssetCardSkeleton } from '../components/shared/ip-asset-card'

export default function DashboardPage() {
  const { isConnected } = useAccount()
  const { analytics, listings, recentPayments, isLoading, error } = useIPayAnalytics()

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <LayoutDashboard className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">Creator Dashboard</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Track your IP listings, revenue, and usage analytics.
          </p>
          <ConnectButton />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
          <p className="text-muted-foreground">Track your IP revenue and analytics</p>
        </div>
        <Link href="/ipay">
          <Button variant="outline">
            Back to Marketplace
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Total Revenue"
          value={analytics ? <PriceDisplay amount={analytics.totalRevenue} /> : '-'}
          icon={<DollarSign className="h-5 w-5" />}
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Uses"
          value={analytics?.totalUses.toString() || '0'}
          icon={<Zap className="h-5 w-5" />}
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Listings"
          value={`${analytics?.activeListings || 0} / ${analytics?.totalListings || 0}`}
          icon={<Package className="h-5 w-5" />}
          isLoading={isLoading}
        />
      </div>

      {/* My Listings */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Listings</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <IPAssetCardSkeleton key={i} />)}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
            icon={<Package className="h-12 w-12" />}
            title="No listings yet"
            description="Create your first IP listing to start earning"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <IPAssetCard
                key={listing.id}
                listing={{
                  id: listing.id,
                  ipId: listing.storyIPId,
                  title: listing.title,
                  description: listing.description,
                  imageUrl: listing.imageUrl,
                  creator: listing.creator,
                  pricePerUse: listing.pricePerUse,
                  usageCount: listing.totalUses,
                  category: listing.category,
                  isActive: listing.isActive,
                }}
                onView={(l) => window.open(`/ipay/asset/${l.id}`, '_blank')}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recent Payments */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Payments Received</h2>
        {isLoading ? (
          <PaymentsSkeleton />
        ) : recentPayments.length === 0 ? (
          <EmptyState
            icon={<DollarSign className="h-12 w-12" />}
            title="No payments yet"
            description="Payments for your IP will appear here"
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentPayments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">Listing #{payment.listingId}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.timestamp * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <PriceDisplay amount={payment.amount} className="text-green-500" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}

// Stats card component
function StatsCard({ title, value, icon, isLoading }: {
  title: string; value: React.ReactNode; icon: React.ReactNode; isLoading: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{value}</div>}
      </CardContent>
    </Card>
  )
}

// Empty state component
function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center py-12 rounded-lg border bg-card">
      <div className="text-muted-foreground mx-auto mb-4">{icon}</div>
      <h4 className="text-lg font-medium mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

// Payments skeleton
function PaymentsSkeleton() {
  return (
    <Card>
      <CardContent className="p-0 divide-y">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
