/**
 * Hook React pour la gestion des fermes
 */

import { useState, useEffect, useCallback } from 'react'
import { Farm } from '@/lib/types/farm'
import { farmsService, FarmFilters } from '@/lib/services/farms.service'
import { logger } from '@/lib/utils/logger'

interface UseFarmsResult {
  farms: Farm[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useFarms(filters?: Partial<FarmFilters>): UseFarmsResult {
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchFarms = useCallback(async () => {
    logger.info('useFarms: Starting fetch', { filters })
    setLoading(true)
    setError(null)

    try {
      const data = await farmsService.getAll(filters)
      logger.info('useFarms: Data received', { count: data.length, data })
      setFarms(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch farms in hook', { error: error.message, stack: error.stack })
    } finally {
      setLoading(false)
      logger.info('useFarms: Fetch completed')
    }
  }, [filters?.ownerId, filters?.groupId, filters?.isDefault, filters?.search])

  useEffect(() => {
    fetchFarms()
  }, [fetchFarms])

  return {
    farms,
    loading,
    error,
    refetch: fetchFarms,
  }
}
