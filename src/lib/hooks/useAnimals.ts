/**
 * Hook React pour la gestion des animaux
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Animal } from '@/lib/types/animal'
import { animalsService, AnimalsFilterParams, PaginationMeta } from '@/lib/services/animals.service'
import { logger } from '@/lib/utils/logger'

interface UseAnimalsResult {
  animals: Animal[]
  meta: PaginationMeta
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

const defaultMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
}

export function useAnimals(filters?: AnimalsFilterParams): UseAnimalsResult {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta)
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
      const result = await animalsService.getAllPaginated(memoizedFilters)
      setAnimals(result.animals)
      setMeta(result.meta)
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
    meta,
    loading,
    error,
    refetch: fetchAnimals,
  }
}
