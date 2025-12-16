'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const IP_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'image', label: 'Images' },
  { value: 'music', label: 'Music' },
  { value: 'video', label: 'Video' },
  { value: 'text', label: 'Text & Writing' },
  { value: 'code', label: 'Code & Software' },
  { value: 'design', label: 'Design & Art' },
  { value: 'data', label: 'Data & Datasets' },
  { value: 'model', label: 'AI Models' },
] as const

export type IPCategory = (typeof IP_CATEGORIES)[number]['value']

interface CategoryFilterProps {
  value: IPCategory
  onChange: (value: IPCategory) => void
  className?: string
}

export function CategoryFilter({ value, onChange, className = '' }: CategoryFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`w-[180px] ${className}`}>
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        {IP_CATEGORIES.map((category) => (
          <SelectItem key={category.value} value={category.value}>
            {category.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Get display label for a category
export function getCategoryLabel(value: IPCategory): string {
  const category = IP_CATEGORIES.find((c) => c.value === value)
  return category?.label ?? 'Unknown'
}
