/**
 * Hook React pour la gestion des races (READ avec création locale)
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Breed, CreateBreedDto } from '@/lib/types/breed'
import { breedsService } from '@/lib/services/breeds.service'
import { logger } from '@/lib/utils/logger'

interface UseBreedsResult {
  breeds: Breed[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  createBreed: (data: CreateBreedDto) => Promise<Breed>
}

export function useBreeds(speciesId?: string): UseBreedsResult {
  const [breeds, setBreeds] = useState<Breed[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Mémoriser speciesId pour éviter les re-renders inutiles
  const memoizedSpeciesId = useMemo(() => speciesId, [speciesId])

  const fetchBreeds = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await breedsService.getAll(memoizedSpeciesId)
      setBreeds(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch breeds in hook', { error, speciesId: memoizedSpeciesId })
    } finally {
      setLoading(false)
    }
  }, [memoizedSpeciesId])

  useEffect(() => {
    fetchBreeds()
  }, [fetchBreeds])

  const createBreed = useCallback(async (data: CreateBreedDto): Promise<Breed> => {
    const newBreed = await breedsService.create(data)
    setBreeds(prev => [...prev, newBreed])
    return newBreed
  }, [])

  return {
    breeds,
    loading,
    error,
    refetch: fetchBreeds,
    createBreed,
  }
}
