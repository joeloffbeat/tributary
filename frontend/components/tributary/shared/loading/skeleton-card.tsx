'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface SkeletonCardProps {
  variant?: 'vault' | 'listing' | 'holding'
}

export function SkeletonCard({ variant = 'vault' }: SkeletonCardProps) {
  return (
    <Card className="bg-river-800/50 border-river-700 overflow-hidden">
      <CardHeader className="pb-2">
        {/* Image skeleton */}
        <Skeleton className="aspect-video rounded-lg mb-4 shimmer" />

        {/* Title and badge */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Stats rows */}
        {variant === 'vault' && (
          <>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </>
        )}

        {variant === 'listing' && (
          <>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-10 w-full mt-2" />
          </>
        )}

        {variant === 'holding' && (
          <>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
