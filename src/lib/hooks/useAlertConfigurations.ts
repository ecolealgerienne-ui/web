/**
 * Hook React pour les configurations d'alertes
 */

import { useState, useEffect, useCallback } from 'react'
import { AlertConfiguration } from '@/lib/types/alert-configuration'
import { alertConfigurationsService, AlertConfigurationFilters } from '@/lib/services/alert-configurations.service'
import { logger } from '@/lib/utils/logger'

interface UseAlertConfigurationsResult {
  alertConfigurations: AlertConfiguration[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useAlertConfigurations(filters?: Partial<AlertConfigurationFilters>): UseAlertConfigurationsResult {
  const [alertConfigurations, setAlertConfigurations] = useState<AlertConfiguration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAlertConfigurations = useCallback(async () => {
    logger.info('useAlertConfigurations: Starting fetch', { filters })
    setLoading(true)
    setError(null)

    try {
      const data = await alertConfigurationsService.getAll(filters)
      logger.info('useAlertConfigurations: Data received', { count: data.length, data })
      setAlertConfigurations(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch alert configurations in hook', { error: error.message, stack: error.stack })
    } finally {
      setLoading(false)
      logger.info('useAlertConfigurations: Fetch completed')
    }
  }, [filters?.type, filters?.category, filters?.enabled])

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
