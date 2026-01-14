'use client'

interface IntervalSelectorProps {
  value: '1m' | '5m' | '1h' | '1d'
  onChange: (interval: '1m' | '5m' | '1h' | '1d') => void
}

const INTERVALS = [
  { value: '1m', label: '1M' },
  { value: '5m', label: '5M' },
  { value: '1h', label: '1H' },
  { value: '1d', label: '1D' },
] as const

export function IntervalSelector({ value, onChange }: IntervalSelectorProps) {
  return (
    <div className="flex gap-1">
      {INTERVALS.map((interval) => (
        <button
          key={interval.value}
          onClick={() => onChange(interval.value)}
          className={`px-3 py-1 font-body text-xs rounded transition-colors ${
            value === interval.value
              ? 'bg-tributary text-white'
              : 'bg-cream-dark text-text-secondary hover:bg-cream-dark/70'
          }`}
        >
          {interval.label}
        </button>
      ))}
    </div>
  )
}
