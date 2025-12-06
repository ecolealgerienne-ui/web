/**
 * Hook React pour la gestion des races (via préférences ferme)
 * Utilise les préférences de la ferme, pas le référentiel admin
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { breedPreferencesService } from '@/lib/services/breed-preferences.service'
import { logger } from '@/lib/utils/logger'
import { TEMP_FARM_ID } from '@/lib/auth/config'

interface Breed {
  id: string
  name: string
  speciesId: string
}

interface UseBreedsResult {
  breeds: Breed[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useBreeds(speciesId?: string): UseBreedsResult {
  const [allBreeds, setAllBreeds] = useState<Breed[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Mémoriser speciesId pour éviter les re-renders inutiles
  const memoizedSpeciesId = useMemo(() => speciesId, [speciesId])

  const fetchBreeds = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const preferences = await breedPreferencesService.getAll(TEMP_FARM_ID)
      // Mapper les préférences vers un format simple { id, name, speciesId }
      const breedsList: Breed[] = preferences
        .filter(p => p.isActive)
        .map(p => ({
          id: p.breedId,
          name: p.breed?.nameFr || p.breed?.nameEn || p.breedId,
          speciesId: p.breed?.speciesId || '',
        }))
      setAllBreeds(breedsList)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch breed preferences in hook', { error })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBreeds()
  }, [fetchBreeds])

  // Filtrer les races par espèce si speciesId est fourni
  const breeds = useMemo(() => {
    if (!memoizedSpeciesId) return allBreeds
    return allBreeds.filter(b => b.speciesId === memoizedSpeciesId)
  }, [allBreeds, memoizedSpeciesId])

  return {
    breeds,
    loading,
    error,
    refetch: fetchBreeds,
  }
}
