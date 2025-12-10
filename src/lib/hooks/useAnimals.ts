/**
 * Hook React pour la gestion des animaux
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Animal } from '@/lib/types/animal'
import { animalsService, AnimalsFilterParams } from '@/lib/services/animals.service'
import { logger } from '@/lib/utils/logger'

interface UseAnimalsResult {
  animals: Animal[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useAnimals(filters?: AnimalsFilterParams): UseAnimalsResult {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Extraire les valeurs des filtres pour éviter les re-renders inutiles
  const filterStatus = filters?.status
  const filterSpeciesId = filters?.speciesId
  const filterSearch = filters?.search
  const filterLimit = filters?.limit
  const filterPage = filters?.page
  const filterNotWeighedDays = filters?.notWeighedDays
  const filterMinWeight = filters?.minWeight
  const filterMaxWeight = filters?.maxWeight

  const memoizedFilters = useMemo(() => ({
    status: filterStatus,
    speciesId: filterSpeciesId,
    search: filterSearch,
    limit: filterLimit,
    page: filterPage,
    notWeighedDays: filterNotWeighedDays,
    minWeight: filterMinWeight,
    maxWeight: filterMaxWeight,
  }), [filterStatus, filterSpeciesId, filterSearch, filterLimit, filterPage, filterNotWeighedDays, filterMinWeight, filterMaxWeight])

  const fetchAnimals = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await animalsService.getAll(memoizedFilters)
      setAnimals(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch animals in hook', { error })
    } finally {
      setLoading(false)
    }
  }, [memoizedFilters])

  useEffect(() => {
    fetchAnimals()
  }, [fetchAnimals])

  return {
    animals,
    loading,
    error,
    refetch: fetchAnimals,
  }
}
