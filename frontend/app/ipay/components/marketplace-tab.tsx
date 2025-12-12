'use client'

import { useState, useMemo } from 'react'
import { Search, Store, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { IPAssetCard, IPAssetCardSkeleton, type IPAssetListing } from './shared/ip-asset-card'
import { CategoryFilter, type IPCategory } from './shared/category-filter'

// Mock data for development
const MOCK_LISTINGS: IPAssetListing[] = [
  {
    id: '1',
    ipId: '0x1234567890abcdef1234567890abcdef12345678',
    title: 'Abstract Digital Art Collection',
    description: 'A collection of abstract digital artworks',
    imageUrl: 'https://picsum.photos/seed/art1/400/300',
    creator: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
    creatorName: 'ArtistOne',
    pricePerUse: 100000n, // 0.1 USDC
    usageCount: 156,
    category: 'image',
    isActive: true,
  },
  {
    id: '2',
    ipId: '0x2345678901bcdef02345678901bcdef023456789',
    title: 'Lo-Fi Beats Sample Pack',
    description: 'Chill lo-fi beats for your projects',
    imageUrl: 'https://picsum.photos/seed/music1/400/300',
    creator: '0xBcDeF12345678901BcDeF12345678901BcDeF123',
    creatorName: 'BeatMaker',
    pricePerUse: 500000n, // 0.5 USDC
    usageCount: 89,
    category: 'music',
    isActive: true,
  },
  {
    id: '3',
    ipId: '0x3456789012cdef013456789012cdef0134567890',
    title: 'Stock Video Footage Pack',
    description: 'High quality stock video footage',
    imageUrl: 'https://picsum.photos/seed/video1/400/300',
    creator: '0xCdEf123456789012CdEf123456789012CdEf1234',
    pricePerUse: 1000000n, // 1 USDC
    usageCount: 42,
    category: 'video',
    isActive: true,
  },
  {
    id: '4',
    ipId: '0x456789013def0124567890134567890123456780',
    title: 'UI Component Library',
    description: 'Reusable UI components for web apps',
    imageUrl: 'https://picsum.photos/seed/code1/400/300',
    creator: '0xDeF1234567890123DeF1234567890123DeF12345',
    creatorName: 'DevStudio',
    pricePerUse: 2000000n, // 2 USDC
    usageCount: 234,
    category: 'code',
    isActive: true,
  },
  {
    id: '5',
    ipId: '0x567890124ef01235678901245678901234567891',
    title: 'Brand Identity Pack',
    description: 'Complete brand identity design assets',
    imageUrl: 'https://picsum.photos/seed/design1/400/300',
    creator: '0xEf12345678901234Ef12345678901234Ef123456',
    pricePerUse: 5000000n, // 5 USDC
    usageCount: 18,
    category: 'design',
    isActive: true,
  },
  {
    id: '6',
    ipId: '0x6789012345f012346789012345678901234567892',
    title: 'GPT Fine-tuned Model',
    description: 'Specialized AI model for content generation',
    imageUrl: 'https://picsum.photos/seed/model1/400/300',
    creator: '0xF123456789012345F123456789012345F1234567',
    creatorName: 'AILabs',
    pricePerUse: 10000000n, // 10 USDC
    usageCount: 567,
    category: 'model',
    isActive: true,
  },
]

interface MarketplaceTabProps {
  address?: string
}

export function MarketplaceTab({ address }: MarketplaceTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState<IPCategory>('all')
  const [isLoading, setIsLoading] = useState(false)

  // Filter listings based on search and category
  const filteredListings = useMemo(() => {
    return MOCK_LISTINGS.filter((listing) => {
      const matchesSearch =
        searchQuery === '' ||
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = category === 'all' || listing.category === category

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, category])

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const handleView = (listing: IPAssetListing) => {
    console.log('View listing:', listing)
    // TODO: Open detail modal or navigate to detail page
  }

  const handlePayAndUse = (listing: IPAssetListing) => {
    console.log('Pay and use:', listing)
    // TODO: Open payment dialog
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search IP assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <CategoryFilter value={category} onChange={setCategory} />
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'} found
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <IPAssetCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-12 rounded-lg border bg-card">
          <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-medium mb-2">No Listings Found</h4>
          <p className="text-sm text-muted-foreground">
            {searchQuery || category !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'No IP assets are currently listed'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <IPAssetCard
              key={listing.id}
              listing={listing}
              onView={handleView}
              onPayAndUse={handlePayAndUse}
            />
          ))}
        </div>
      )}
    </div>
  )
}
