/**
 * Hook React pour la gestion des événements d'animaux
 * Conforme aux normes DEVELOPMENT_STANDARDS.md (règle 7.7)
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { AnimalEvent } from '@/lib/types/animal-event'
import { animalEventsService, AnimalEventFilterParams } from '@/lib/services/animal-events.service'
import { logger } from '@/lib/utils/logger'

interface UseAnimalEventsResult {
  events: AnimalEvent[]
  total: number
  loading: boolean
  error: Error | null
  params: AnimalEventFilterParams
  setParams: React.Dispatch<React.SetStateAction<AnimalEventFilterParams>>
  refetch: () => Promise<void>
}

const DEFAULT_PARAMS: AnimalEventFilterParams = {
  page: 1,
  limit: 25,
}

export function useAnimalEvents(initialParams?: Partial<AnimalEventFilterParams>): UseAnimalEventsResult {
  const [events, setEvents] = useState<AnimalEvent[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [params, setParams] = useState<AnimalEventFilterParams>({
    ...DEFAULT_PARAMS,
    ...initialParams,
  })

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await animalEventsService.getAll(params)
      setEvents(response.data)
      setTotal(response.meta.total)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch animal events in hook', { error })
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return {
    events,
    total,
    loading,
    error,
    params,
    setParams,
    refetch: fetchEvents,
  }
}
