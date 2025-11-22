/**
 * Hook React pour la gestion des races
 */

import { useState, useEffect, useCallback } from 'react'
import { Breed } from '@/lib/types/breed'
import { breedsService } from '@/lib/services/breeds.service'
import { useToast } from '@/contexts/toast-context'
import { logger } from '@/lib/utils/logger'

interface UseBreedsResult {
  breeds: Breed[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useBreeds(species?: string): UseBreedsResult {
  const toast = useToast()
  const [breeds, setBreeds] = useState<Breed[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchBreeds = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await breedsService.getAll(species)
      setBreeds(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch breeds in hook', { error })
      toast.error('Erreur', 'Impossible de charger les races')
    } finally {
      setLoading(false)
    }
  }, [species]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchBreeds()
  }, [fetchBreeds])

  return {
    breeds,
    loading,
    error,
    refetch: fetchBreeds,
  }
}
