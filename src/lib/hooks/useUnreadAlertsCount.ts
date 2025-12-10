/**
 * Hook for unread alerts count (badge)
 * Optimized for frequent polling with lightweight endpoint
 */

import { useState, useEffect, useCallback } from 'react'
import { farmAlertsService } from '@/lib/services/farm-alerts.service'
import { logger } from '@/lib/utils/logger'

interface UseUnreadAlertsCountOptions {
  /** Polling interval in ms (default: 30000 = 30s) */
  pollingInterval?: number
  /** Disable polling */
  disablePolling?: boolean
}

interface UseUnreadAlertsCountResult {
  /** Number of unread alerts */
  count: number
  /** Loading state */
  loading: boolean
  /** Manual refresh */
  refetch: () => Promise<void>
}

/**
 * Lightweight hook for badge counter
 * Optimized for frequent polling (lightweight endpoint)
 */
export function useUnreadAlertsCount(
  farmId: string | undefined,
  options?: UseUnreadAlertsCountOptions
): UseUnreadAlertsCountResult {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const pollingInterval = options?.pollingInterval ?? 30000 // 30 seconds default

  const fetchCount = useCallback(async () => {
    if (!farmId) {
      setCount(0)
      setLoading(false)
      return
    }

    try {
      const unreadCount = await farmAlertsService.getUnreadCount(farmId)
      setCount(unreadCount)
    } catch (error) {
      // Silent for polling - don't block UI
      logger.warn('Failed to fetch unread alerts count', { error, farmId })
    } finally {
      setLoading(false)
    }
  }, [farmId])

  // Initial fetch
  useEffect(() => {
    fetchCount()
  }, [fetchCount])

  // Polling
  useEffect(() => {
    if (options?.disablePolling || !farmId) return

    const interval = setInterval(fetchCount, pollingInterval)
    return () => clearInterval(interval)
  }, [farmId, pollingInterval, options?.disablePolling, fetchCount])

  return {
    count,
    loading,
    refetch: fetchCount,
  }
}
