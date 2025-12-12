import { useState, useEffect, useCallback, useRef } from 'react'
import { hexToString } from 'viem'
import { hyperlaneService } from '@/lib/services/hyperlane-service'
import { STORAGE_KEYS, POLLING_INTERVAL_MS } from '../constants'
import type { TrackedMessage } from '../types'

export function useMessageHistory() {
  const [trackedMessages, setTrackedMessages] = useState<TrackedMessage[]>([])
  const [isPolling, setIsPolling] = useState(false)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const messagesRef = useRef<TrackedMessage[]>([])

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY)
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory)
        if (Array.isArray(parsed)) {
          setTrackedMessages(parsed)
        }
      }
    } catch {
      // Silent fail
    }
  }, [])

  // Save history to localStorage when it changes and keep ref in sync
  useEffect(() => {
    messagesRef.current = trackedMessages
    if (trackedMessages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trackedMessages))
      } catch {
        // Silent fail
      }
    }
  }, [trackedMessages])

  // Decode message body from hex
  const decodeMessageBody = (body: string | undefined): string | undefined => {
    if (!body || body === '0x' || body.length < 4) return undefined
    try {
      return hexToString(body as `0x${string}`)
    } catch {
      return body // Return raw hex if decode fails
    }
  }

  // Update message with API data
  const updateMessageWithApiData = useCallback(
    (messageId: string, apiData: {
      status: 'pending' | 'delivered' | 'failed'
      destinationTxHash?: string
      body?: string
    }) => {
      setTrackedMessages((prev) =>
        prev.map((m) =>
          m.messageId === messageId
            ? {
                ...m,
                status: apiData.status,
                destinationTxHash: apiData.destinationTxHash || m.destinationTxHash,
                body: decodeMessageBody(apiData.body) || m.body,
                lastChecked: Date.now(),
              }
            : m
        )
      )
    },
    []
  )

  // Get pending message IDs for dependency tracking (only IDs, not full objects)
  const pendingMessageIds = trackedMessages
    .filter((m) => m.status === 'pending' && m.messageId && m.messageId !== '0x')
    .map((m) => m.messageId)
    .join(',')

  // Poll for status updates - only restarts when pending message IDs change
  useEffect(() => {
    if (!pendingMessageIds) {
      setIsPolling(false)
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      return
    }

    setIsPolling(true)

    const pollStatus = async () => {
      // Use ref to get current messages to avoid stale closure
      const currentPending = messagesRef.current.filter(
        (m) => m.status === 'pending' && m.messageId && m.messageId !== '0x'
      )

      const updatePromises = currentPending.map(async (msg) => {
        try {
          const statusResult = await hyperlaneService.getMessageStatus(msg.messageId)
          updateMessageWithApiData(msg.messageId, {
            status: statusResult.status,
            destinationTxHash: statusResult.destinationTxHash,
            body: statusResult.body,
          })
        } catch {
          // Update lastChecked even on failure
          setTrackedMessages((prev) =>
            prev.map((m) =>
              m.messageId === msg.messageId ? { ...m, lastChecked: Date.now() } : m
            )
          )
        }
      })
      await Promise.all(updatePromises)
    }

    // Poll immediately on first mount or when new pending messages are added
    pollStatus()

    // Set up interval polling
    pollIntervalRef.current = setInterval(pollStatus, POLLING_INTERVAL_MS)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      setIsPolling(false)
    }
  }, [pendingMessageIds, updateMessageWithApiData])

  // Track a new message
  const trackMessage = useCallback((message: TrackedMessage) => {
    setTrackedMessages((prev) => [{ ...message, lastChecked: Date.now() }, ...prev.slice(0, 49)])
  }, [])

  // Clear all history
  const clearHistory = useCallback(() => {
    setTrackedMessages([])
    localStorage.removeItem(STORAGE_KEYS.HISTORY)
  }, [])

  // Remove a single message
  const removeFromHistory = useCallback((messageId: string) => {
    setTrackedMessages((prev) => prev.filter((m) => m.messageId !== messageId))
  }, [])

  // Update message status (legacy - kept for compatibility)
  const updateMessageStatus = useCallback(
    (messageId: string, status: TrackedMessage['status'], destinationTxHash?: string) => {
      setTrackedMessages((prev) =>
        prev.map((m) =>
          m.messageId === messageId
            ? { ...m, status, destinationTxHash: destinationTxHash || m.destinationTxHash, lastChecked: Date.now() }
            : m
        )
      )
    },
    []
  )

  // Refresh all statuses (both pending and non-pending)
  const refreshStatuses = useCallback(async () => {
    const updated = await Promise.all(
      trackedMessages.map(async (msg) => {
        try {
          const apiResult = await hyperlaneService.getMessageStatus(msg.messageId, msg.originChainId)
          return {
            ...msg,
            status: apiResult.status,
            destinationTxHash: apiResult.destinationTxHash || msg.destinationTxHash,
            body: decodeMessageBody(apiResult.body) || msg.body,
            lastChecked: Date.now(),
          }
        } catch {
          return { ...msg, lastChecked: Date.now() }
        }
      })
    )
    setTrackedMessages(updated)
  }, [trackedMessages])

  // Add manual message
  const addManualMessage = useCallback((messageId: string) => {
    if (!messageId || !messageId.startsWith('0x')) return

    const newMsg: TrackedMessage = {
      messageId,
      originChainId: 0,
      destinationChainId: 0,
      type: 'message',
      status: 'pending',
      originTxHash: '',
      timestamp: Date.now(),
      description: 'Manually tracked message',
      lastChecked: Date.now(),
    }

    setTrackedMessages((prev) => [newMsg, ...prev])
  }, [])

  return {
    trackedMessages,
    isPolling,
    trackMessage,
    clearHistory,
    removeFromHistory,
    updateMessageStatus,
    refreshStatuses,
    addManualMessage,
    setTrackedMessages,
  }
}
