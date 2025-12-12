import { DISPATCH_ID_EVENT_SIGNATURE } from './constants'
import { getHyperlaneDeployment } from '@/constants/hyperlane'

/**
 * Get chain display name - checks both hosted and self-hosted deployments
 */
export function getChainDisplayName(chainId: number): string {
  const hostedDeployment = getHyperlaneDeployment(chainId, 'hosted')
  if (hostedDeployment) return hostedDeployment.displayName

  const selfHostedDeployment = getHyperlaneDeployment(chainId, 'self-hosted')
  if (selfHostedDeployment) return selfHostedDeployment.displayName

  return `Chain ${chainId}`
}

/**
 * Extract message ID from transaction logs by finding the DispatchId event
 */
export function extractMessageIdFromLogs(logs: any[]): string {
  if (!logs || logs.length === 0) return '0x'

  const dispatchIdLog = logs.find((log: any) => {
    return log.topics?.[0]?.toLowerCase() === DISPATCH_ID_EVENT_SIGNATURE.toLowerCase()
  })

  if (dispatchIdLog && dispatchIdLog.topics[1]) {
    return dispatchIdLog.topics[1] as string
  }

  const fallbackLog = logs.find((log: any) => log.topics?.length >= 2)
  return fallbackLog?.topics?.[1] || '0x'
}

/**
 * Format time in seconds to readable string
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) return `~${seconds}s`
  return `~${Math.ceil(seconds / 60)}m`
}

/**
 * Format timestamp to readable date/time
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

/**
 * Format timestamp to relative "time ago" string
 */
export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)

  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
