'use client'

import { SkeletonCard } from './skeleton-card'

interface SkeletonGridProps {
  count?: number
  variant?: 'vault' | 'listing' | 'holding'
  columns?: 2 | 3 | 4
}

export function SkeletonGrid({
  count = 6,
  variant = 'vault',
  columns = 3,
}: SkeletonGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={`grid gap-4 ${gridCols[columns]}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </div>
  )
}
