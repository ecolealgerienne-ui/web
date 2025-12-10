/**
 * Hook for managing farm alerts
 * Provides alerts list, summary, pagination, and actions
 */

import { useState, useEffect, useCallback } from 'react'
import { farmAlertsService } from '@/lib/services/farm-alerts.service'
import { logger } from '@/lib/utils/logger'
import type {
  FarmAlert,
  FarmAlertsFilterParams,
  FarmAlertsSummary,
} from '@/lib/types/farm-alert'

interface UseFarmAlertsOptions {
  /** Enable automatic polling (interval in ms) */
  pollingInterval?: number
  /** Default filters */
  defaultFilters?: FarmAlertsFilterParams
}

interface UseFarmAlertsResult {
  /** List of alerts */
  alerts: FarmAlert[]
  /** Alerts summary */
  summary: FarmAlertsSummary | null
  /** Loading state */
  loading: boolean
  /** Error state */
  error: Error | null
  /** Pagination metadata */
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  /** Current filters */
  filters: FarmAlertsFilterParams
  /** Update filters */
  setFilters: (filters: FarmAlertsFilterParams) => void
  /** Mark an alert as read */
  markAsRead: (alertId: string) => Promise<void>
  /** Dismiss an alert */
  dismiss: (alertId: string) => Promise<void>
  /** Mark all alerts as read */
  markAllAsRead: () => Promise<void>
  /** Refresh data */
  refetch: () => Promise<void>
}

export function useFarmAlerts(
  farmId: string | undefined,
  options?: UseFarmAlertsOptions
): UseFarmAlertsResult {
  const [alerts, setAlerts] = useState<FarmAlert[]>([])
  const [summary, setSummary] = useState<FarmAlertsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  })
  const [filters, setFilters] = useState<FarmAlertsFilterParams>(
    options?.defaultFilters ?? { page: 1, limit: 20 }
  )

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    if (!farmId) {
      setAlerts([])
      setSummary(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [alertsResponse, summaryResponse] = await Promise.all([
        farmAlertsService.getAlerts(farmId, filters),
        farmAlertsService.getSummary(farmId),
      ])

      setAlerts(alertsResponse.data)
      setPagination(alertsResponse.meta)
      setSummary(summaryResponse)

      logger.info('Farm alerts loaded', {
        farmId,
        count: alertsResponse.data.length,
        unread: summaryResponse.unread,
      })
    } catch (err) {
      const fetchError = err as Error
      setError(fetchError)
      logger.error('Failed to fetch farm alerts', { error: fetchError, farmId })
    } finally {
      setLoading(false)
    }
  }, [farmId, filters])

  // Initial fetch
  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  // Optional polling
  useEffect(() => {
    if (!options?.pollingInterval || !farmId) return

    const interval = setInterval(() => {
      // Light polling: only summary
      farmAlertsService
        .getSummary(farmId)
        .then(setSummary)
        .catch(() => {
          // Silent error for polling
        })
    }, options.pollingInterval)

    return () => clearInterval(interval)
  }, [farmId, options?.pollingInterval])

  // Actions
  const markAsRead = useCallback(
    async (alertId: string) => {
      if (!farmId) return
      await farmAlertsService.markAsRead(farmId, alertId)
      await fetchAlerts()
    },
    [farmId, fetchAlerts]
  )

  const dismiss = useCallback(
    async (alertId: string) => {
      if (!farmId) return
      await farmAlertsService.dismiss(farmId, alertId)
      await fetchAlerts()
    },
    [farmId, fetchAlerts]
  )

  const markAllAsRead = useCallback(async () => {
    if (!farmId) return
    await farmAlertsService.markAllAsRead(farmId)
    await fetchAlerts()
  }, [farmId, fetchAlerts])

  return {
    alerts,
    summary,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    markAsRead,
    dismiss,
    markAllAsRead,
    refetch: fetchAlerts,
  }
}
