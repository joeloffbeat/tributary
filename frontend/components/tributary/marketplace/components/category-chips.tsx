'use client'

import { motion } from 'framer-motion'
import { Music, Image, Video, Gamepad2, BookOpen, Sparkles, LayoutGrid } from 'lucide-react'
import type { VaultCategory } from './marketplace-filters'

const categories: { value: VaultCategory; label: string; icon: typeof Music }[] = [
  { value: 'all', label: 'All', icon: LayoutGrid },
  { value: 'music', label: 'Music', icon: Music },
  { value: 'art', label: 'Art', icon: Image },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { value: 'literature', label: 'Literature', icon: BookOpen },
  { value: 'other', label: 'Other', icon: Sparkles },
]

interface CategoryChipsProps {
  selected: VaultCategory
  onSelect: (category: VaultCategory) => void
}

export function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map(({ value, label, icon: Icon }) => {
        const isActive = selected === value
        return (
          <motion.button
            key={value}
            onClick={() => onSelect(value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
              transition-colors whitespace-nowrap
              ${isActive
                ? 'bg-tributary-500 text-white'
                : 'bg-river-800/50 text-muted-foreground hover:bg-river-700/50 hover:text-foreground'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            {label}
          </motion.button>
        )
      })}
    </div>
  )
}
