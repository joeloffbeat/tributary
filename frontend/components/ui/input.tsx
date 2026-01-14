import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block font-body text-sm text-text-secondary">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full px-4 py-3 rounded bg-white border border-cream-dark text-text-primary transition-all duration-200",
          "font-roboto font-light uppercase tracking-wider text-sm",
          "focus:outline-none focus:border-tributary",
          "placeholder:text-text-muted placeholder:normal-case",
          error ? "border-destructive focus:border-destructive" : "",
          className
        )}
        {...props}
      />
      {error && (
        <p className="font-body text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
