/**
 * Hook React pour charger une seule ferme
 */

import { useState, useEffect, useCallback } from 'react'
import { Farm } from '@/lib/types/farm'
import { farmsService } from '@/lib/services/farms.service'
import { logger } from '@/lib/utils/logger'

interface UseFarmResult {
  farm: Farm | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useFarm(farmId: string | undefined, includeStats = false): UseFarmResult {
  const [farm, setFarm] = useState<Farm | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchFarm = useCallback(async () => {
    if (!farmId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await farmsService.getById(farmId, includeStats)
      setFarm(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch farm in hook', { error, farmId })
    } finally {
      setLoading(false)
    }
  }, [farmId, includeStats])

  useEffect(() => {
    fetchFarm()
  }, [fetchFarm])

  return {
    farm,
    loading,
    error,
    refetch: fetchFarm,
  }
}
