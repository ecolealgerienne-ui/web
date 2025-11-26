/**
 * Hook React pour les configurations d'alertes
 */

import { useState, useEffect, useCallback } from 'react'
import { AlertConfiguration, AlertType } from '@/lib/types/alert-configuration'
import { alertConfigurationsService } from '@/lib/services/alert-configurations.service'
import { logger } from '@/lib/utils/logger'

interface UseAlertConfigurationsResult {
  alertConfigurations: AlertConfiguration[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useAlertConfigurations(filters?: { type?: AlertType; enabled?: boolean }): UseAlertConfigurationsResult {
  const [alertConfigurations, setAlertConfigurations] = useState<AlertConfiguration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAlertConfigurations = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await alertConfigurationsService.getAll(filters)
      setAlertConfigurations(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch alert configurations in hook', { error })
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchAlertConfigurations()
  }, [fetchAlertConfigurations])

  return {
    alertConfigurations,
    loading,
    error,
    refetch: fetchAlertConfigurations,
  }
}
