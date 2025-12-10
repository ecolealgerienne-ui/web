/**
 * Hook React pour la gestion des événements d'animaux
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { AnimalEvent } from '@/lib/types/animal-event'
import { animalEventsService } from '@/lib/services/animal-events.service'
import { logger } from '@/lib/utils/logger'

interface UseAnimalEventsResult {
  events: AnimalEvent[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useAnimalEvents(filters?: { animalId?: string; eventType?: string; fromDate?: string; toDate?: string }): UseAnimalEventsResult {
  const [events, setEvents] = useState<AnimalEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Extraire les valeurs des filtres pour éviter les re-renders inutiles
  const filterAnimalId = filters?.animalId
  const filterEventType = filters?.eventType
  const filterFromDate = filters?.fromDate
  const filterToDate = filters?.toDate

  const memoizedFilters = useMemo(() => ({
    animalId: filterAnimalId,
    eventType: filterEventType,
    fromDate: filterFromDate,
    toDate: filterToDate,
  }), [filterAnimalId, filterEventType, filterFromDate, filterToDate])

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await animalEventsService.getAll(memoizedFilters)
      setEvents(data)
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
    loading,
    error,
    refetch: fetchEvents,
  }
}
