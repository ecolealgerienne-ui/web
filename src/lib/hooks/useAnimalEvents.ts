/**
 * Hook React pour la gestion des événements d'animaux (mouvements)
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { AnimalEvent } from '@/lib/types/animal-event'
import { animalEventsService, MovementsFilterParams, PaginationMeta } from '@/lib/services/animal-events.service'
import { logger } from '@/lib/utils/logger'

interface UseAnimalEventsResult {
  events: AnimalEvent[]
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

export function useAnimalEvents(filters?: MovementsFilterParams): UseAnimalEventsResult {
  const [events, setEvents] = useState<AnimalEvent[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Extraire les valeurs des filtres pour éviter les re-renders inutiles
  const filterAnimalId = filters?.animalId
  const filterMovementType = filters?.movementType
  const filterFromDate = filters?.fromDate
  const filterToDate = filters?.toDate
  const filterLimit = filters?.limit
  const filterPage = filters?.page

  const memoizedFilters = useMemo(() => ({
    animalId: filterAnimalId,
    movementType: filterMovementType,
    fromDate: filterFromDate,
    toDate: filterToDate,
    limit: filterLimit,
    page: filterPage,
  }), [filterAnimalId, filterMovementType, filterFromDate, filterToDate, filterLimit, filterPage])

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await animalEventsService.getAllPaginated(memoizedFilters)
      setEvents(result.events)
      setMeta(result.meta)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch animal events in hook', { error })
    } finally {
      setLoading(false)
    }
  }, [memoizedFilters])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return {
    events,
    meta,
    loading,
    error,
    refetch: fetchEvents,
  }
}
