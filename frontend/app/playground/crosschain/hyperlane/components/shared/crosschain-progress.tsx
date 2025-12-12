'use client'

import { useEffect, useState, useCallback } from 'react'
import { createPublicClient, http } from 'viem'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Loader2, XCircle, ExternalLink, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getChainById } from '@/lib/config/chains'
import { hyperlaneService } from '@/lib/services/hyperlane-service'
import { getChainDisplayName } from '../../utils'
import type { HyperlaneMode } from '../../types'

export type ProgressStep = {
  id: 'submit' | 'confirm' | 'relay' | 'deliver'
  label: string
  status: 'pending' | 'active' | 'complete' | 'error'
  txHash?: string
  error?: string
}

interface CrosschainProgressProps {
  originChainId: number
  destinationChainId: number
  messageId: string | null
  originTxHash: string | null
  steps: ProgressStep[]
  onClose: () => void
  onRetry?: () => void
  hyperlaneMode: HyperlaneMode
  publicClient?: any
}

const POLL_INTERVAL = 3000 // 3 seconds

export function CrosschainProgress({
  originChainId,
  destinationChainId,
  messageId,
  originTxHash,
  steps,
  onClose,
  onRetry,
  hyperlaneMode,
  publicClient,
}: CrosschainProgressProps) {
  const [currentSteps, setCurrentSteps] = useState<ProgressStep[]>(steps)
  const [isDelivered, setIsDelivered] = useState(false)
  const [destinationTxHash, setDestinationTxHash] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState(false)

  const originExplorer = hyperlaneService.getDeployment(originChainId)?.explorerUrl
  const destExplorer = hyperlaneService.getDeployment(destinationChainId)?.explorerUrl

  // Poll for delivery status
  const checkDeliveryStatus = useCallback(async () => {
    if (!messageId || isDelivered) return

    try {
      if (hyperlaneMode === 'self-hosted') {
        // For self-hosted: check on-chain mailbox.delivered()
        // IMPORTANT: Must use destination chain's RPC, not the connected wallet's chain
        const destMailbox = hyperlaneService.getMailboxAddress(destinationChainId, hyperlaneMode)
        const destChainConfig = getChainById(destinationChainId)

        if (destMailbox && destChainConfig) {
          // Create a public client for the destination chain
          const destPublicClient = createPublicClient({
            chain: destChainConfig.chain,
            transport: http(destChainConfig.rpcUrl),
          })

          const delivered = await destPublicClient.readContract({
            address: destMailbox,
            abi: [
              {
                name: 'delivered',
                type: 'function',
                stateMutability: 'view',
                inputs: [{ name: '_messageId', type: 'bytes32' }],
                outputs: [{ name: '', type: 'bool' }],
              },
            ],
            functionName: 'delivered',
            args: [messageId as `0x${string}`],
          })

          if (delivered) {
            setIsDelivered(true)
            setCurrentSteps((prev) =>
              prev.map((s) => (s.id === 'deliver' ? { ...s, status: 'complete' } : s))
            )
          }
        }
      } else {
        // For hosted: use Explorer API
        const status = await hyperlaneService.getMessageStatus(messageId)
        if (status.status === 'delivered') {
          setIsDelivered(true)
          setDestinationTxHash(status.destinationTxHash || null)
          setCurrentSteps((prev) =>
            prev.map((s) => (s.id === 'deliver' ? { ...s, status: 'complete', txHash: status.destinationTxHash } : s))
          )
        } else if (status.status === 'failed') {
          setCurrentSteps((prev) =>
            prev.map((s) => (s.id === 'deliver' ? { ...s, status: 'error', error: 'Delivery failed' } : s))
          )
        }
      }
    } catch (error) {
      console.error('Error checking delivery status:', error)
    }
  }, [messageId, isDelivered, hyperlaneMode, destinationChainId])

  // Start polling when relay step becomes active
  useEffect(() => {
    const relayStep = currentSteps.find((s) => s.id === 'relay')
    if (relayStep?.status !== 'active' && relayStep?.status !== 'complete') return
    if (isDelivered) return

    // Initial check
    checkDeliveryStatus()

    // Set up polling
    const interval = setInterval(checkDeliveryStatus, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [currentSteps, isDelivered, checkDeliveryStatus])

  // Update steps from parent
  useEffect(() => {
    setCurrentSteps(steps)
  }, [steps])

  const copyMessageId = () => {
    if (messageId) {
      navigator.clipboard.writeText(messageId)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  const hasError = currentSteps.some((s) => s.status === 'error')
  const isComplete = currentSteps.every((s) => s.status === 'complete')

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold">Cross-Chain Transfer</h3>
            <p className="text-sm text-muted-foreground">
              {getChainDisplayName(originChainId)} → {getChainDisplayName(destinationChainId)}
            </p>
          </div>
          {isComplete ? (
            <Badge className="bg-green-500">Complete</Badge>
          ) : hasError ? (
            <Badge variant="destructive">Failed</Badge>
          ) : (
            <Badge variant="secondary" className="animate-pulse">In Progress</Badge>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {currentSteps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex flex-col items-center">
                {step.status === 'complete' ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : step.status === 'active' ? (
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                ) : step.status === 'error' ? (
                  <XCircle className="h-6 w-6 text-destructive" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground" />
                )}
                {index < currentSteps.length - 1 && (
                  <div className={cn(
                    "w-0.5 h-8 mt-1",
                    step.status === 'complete' ? "bg-green-500" : "bg-muted"
                  )} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-medium",
                    step.status === 'active' && "text-primary",
                    step.status === 'error' && "text-destructive"
                  )}>
                    {step.label}
                  </span>
                </div>

                {step.status === 'active' && step.id === 'relay' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {hyperlaneMode === 'self-hosted'
                      ? 'Waiting for local relayer to process...'
                      : 'Waiting for Hyperlane relayer...'}
                  </p>
                )}

                {step.error && (
                  <p className="text-xs text-destructive mt-1">{step.error}</p>
                )}

                {step.txHash && (
                  <a
                    href={`${step.id === 'deliver' ? destExplorer : originExplorer}/tx/${step.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    View transaction <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Message ID */}
        {messageId && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Message ID</span>
              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={copyMessageId}>
                {copiedId ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <code className="text-xs break-all">{messageId}</code>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {hasError && onRetry && (
            <Button variant="outline" onClick={onRetry} className="flex-1">
              Retry
            </Button>
          )}
          <Button
            variant={isComplete ? 'default' : 'outline'}
            onClick={onClose}
            className="flex-1"
          >
            {isComplete ? 'Done' : 'Close'}
          </Button>
          {messageId && hyperlaneMode === 'hosted' && (
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a
                href={hyperlaneService.getExplorerUrl(messageId)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Explorer <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper to create initial steps
export function createProgressSteps(): ProgressStep[] {
  return [
    { id: 'submit', label: 'Submitting transaction', status: 'pending' },
    { id: 'confirm', label: 'Confirming on origin chain', status: 'pending' },
    { id: 'relay', label: 'Relaying cross-chain', status: 'pending' },
    { id: 'deliver', label: 'Delivering to destination', status: 'pending' },
  ]
}

// Helper to update step status
export function updateStepStatus(
  steps: ProgressStep[],
  stepId: ProgressStep['id'],
  status: ProgressStep['status'],
  txHash?: string,
  error?: string
): ProgressStep[] {
  return steps.map((s) =>
    s.id === stepId ? { ...s, status, txHash: txHash || s.txHash, error } : s
  )
}
