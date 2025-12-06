/**
 * Hook React pour la gestion des templates d'alertes globaux
 * Utilise l'endpoint /api/v1/alert-templates
 */

import { useState, useEffect, useCallback } from 'react'
import { AlertTemplate } from '@/lib/types/admin/alert-template'
import { alertTemplatesService } from '@/lib/services/admin/alert-templates.service'
import { logger } from '@/lib/utils/logger'

interface UseGlobalAlertsResult {
  alerts: AlertTemplate[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useGlobalAlerts(): UseGlobalAlertsResult {
  const [alerts, setAlerts] = useState<AlertTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await alertTemplatesService.getAll({
        page: 1,
        limit: 100,
        isActive: true,
      })

      setAlerts(response.data)
      logger.info('Global alerts fetched successfully', { count: response.data.length })
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch global alerts in hook', { error })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  return {
    alerts,
    loading,
    error,
    refetch: fetchAlerts,
  }
}
