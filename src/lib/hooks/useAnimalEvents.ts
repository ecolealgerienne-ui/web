/**
 * Hook React pour la gestion des événements d'animaux
 */

import { useState, useEffect, useCallback } from 'react'
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

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await animalEventsService.getAll(filters)
      setEvents(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch animal events in hook', { error })
    } finally {
      setLoading(false)
    }
  }, [filters?.animalId, filters?.eventType, filters?.fromDate, filters?.toDate])

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
