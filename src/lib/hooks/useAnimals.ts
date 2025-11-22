/**
 * Hook React pour la gestion des animaux
 */

import { useState, useEffect, useCallback } from 'react'
import { Animal } from '@/lib/types/animal'
import { animalsService } from '@/lib/services/animals.service'
import { logger } from '@/lib/utils/logger'

interface UseAnimalsResult {
  animals: Animal[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useAnimals(filters?: { status?: string; speciesId?: string; search?: string }): UseAnimalsResult {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAnimals = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await animalsService.getAll(filters)
      setAnimals(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch animals in hook', { error })
    } finally {
      setLoading(false)
    }
  }, [filters?.status, filters?.speciesId, filters?.search])

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
