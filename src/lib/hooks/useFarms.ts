/**
 * Hook React pour la gestion des fermes
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Farm } from '@/lib/types/farm'
import { farmsService } from '@/lib/services/farms.service'
import { logger } from '@/lib/utils/logger'

interface UseFarmsResult {
  farms: Farm[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useFarms(filters?: { ownerId?: string; groupId?: string; isDefault?: boolean; search?: string }): UseFarmsResult {
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Extraire les valeurs des filtres pour éviter les re-renders inutiles
  const filterOwnerId = filters?.ownerId
  const filterGroupId = filters?.groupId
  const filterIsDefault = filters?.isDefault
  const filterSearch = filters?.search

  const memoizedFilters = useMemo(() => ({
    ownerId: filterOwnerId,
    groupId: filterGroupId,
    isDefault: filterIsDefault,
    search: filterSearch,
  }), [filterOwnerId, filterGroupId, filterIsDefault, filterSearch])

  const fetchFarms = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await farmsService.getAll(memoizedFilters)
      setFarms(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch farms in hook', { error })
    } finally {
      setLoading(false)
    }
  }, [memoizedFilters])

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
