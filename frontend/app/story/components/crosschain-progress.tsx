'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircle,
  Loader2,
  ExternalLink,
  XCircle,
  ArrowRight,
  Clock,
  Send,
  Package,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type CrosschainState } from '../hooks/use-crosschain-story'

interface CrosschainProgressProps {
  state: CrosschainState
  operationName: string
  onReset: () => void
  explorerLinks: { origin?: string; hyperlane?: string; dest?: string }
}

const stepLabels = {
  idle: 'Ready',
  quoting: 'Getting quote...',
  confirming: 'Confirm in wallet',
  submitted: 'Submitted to Mantle',
  relaying: 'Relaying to Story',
  delivered: 'Delivered on Story',
  error: 'Error',
}

export function CrosschainProgress({
  state,
  operationName,
  onReset,
  explorerLinks,
}: CrosschainProgressProps) {
  const isComplete = state.step === 'delivered'
  const isError = state.step === 'error'
  const isLoading = ['quoting', 'confirming', 'submitted', 'relaying'].includes(state.step)

  if (state.step === 'idle') return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {isComplete && <CheckCircle className="h-5 w-5 text-green-500" />}
          {isError && <XCircle className="h-5 w-5 text-red-500" />}
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
          {operationName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Steps */}
        <div className="flex items-center justify-between text-sm">
          <StepIndicator
            label="Mantle"
            status={
              state.step === 'quoting' || state.step === 'confirming'
                ? 'active'
                : state.originTxHash
                  ? 'complete'
                  : 'pending'
            }
            icon={<Send className="h-4 w-4" />}
          />
          <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
          <StepIndicator
            label="Hyperlane"
            status={
              state.step === 'relaying'
                ? 'active'
                : state.step === 'delivered'
                  ? 'complete'
                  : 'pending'
            }
            icon={<Package className="h-4 w-4" />}
          />
          <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
          <StepIndicator
            label="Story"
            status={state.step === 'delivered' ? 'complete' : 'pending'}
            icon={<CheckCircle className="h-4 w-4" />}
          />
        </div>

        {/* Status Message */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isComplete && <CheckCircle className="h-4 w-4 text-green-500" />}
            {isError && <XCircle className="h-4 w-4 text-red-500" />}
            <span className="text-sm font-medium">{stepLabels[state.step]}</span>
          </div>
          {state.fee && (
            <p className="text-xs text-muted-foreground mt-1">
              Cross-chain fee: {state.fee} MNT
            </p>
          )}
        </div>

        {/* Error Message */}
        {isError && state.error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Transaction Links */}
        <div className="space-y-2">
          {explorerLinks.origin && (
            <TransactionLink
              label="Origin TX (Mantle)"
              href={explorerLinks.origin}
              hash={state.originTxHash}
            />
          )}
          {explorerLinks.hyperlane && state.messageId && (
            <TransactionLink
              label="Hyperlane Message"
              href={explorerLinks.hyperlane}
              hash={state.messageId}
            />
          )}
          {explorerLinks.dest && (
            <TransactionLink
              label="Destination TX (Story)"
              href={explorerLinks.dest}
              hash={state.destTxHash}
            />
          )}
        </div>

        {/* Actions */}
        {(isComplete || isError) && (
          <Button onClick={onReset} variant="outline" className="w-full">
            {isComplete ? 'New Operation' : 'Try Again'}
          </Button>
        )}

        {state.step === 'relaying' && (
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <Clock className="h-3 w-3" />
            Delivery typically takes 1-5 minutes
          </p>
        )}
      </CardContent>
    </Card>
  )
}

interface StepIndicatorProps {
  label: string
  status: 'pending' | 'active' | 'complete'
  icon: React.ReactNode
}

function StepIndicator({ label, status, icon }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center',
          status === 'pending' && 'bg-muted text-muted-foreground',
          status === 'active' && 'bg-blue-100 text-blue-600',
          status === 'complete' && 'bg-green-100 text-green-600'
        )}
      >
        {status === 'active' ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

interface TransactionLinkProps {
  label: string
  href: string
  hash?: string
}

function TransactionLink({ label, href, hash }: TransactionLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-2 bg-muted/50 rounded hover:bg-muted transition-colors"
    >
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {hash && (
          <p className="text-xs font-mono">
            {hash.slice(0, 10)}...{hash.slice(-8)}
          </p>
        )}
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground" />
    </a>
  )
}
