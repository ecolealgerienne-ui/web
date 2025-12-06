/**
 * Hook React pour la gestion des espèces (via préférences ferme)
 * Utilise les préférences de la ferme, pas le référentiel admin
 */

import { useState, useEffect, useCallback } from 'react'
import { speciesPreferencesService } from '@/lib/services/species-preferences.service'
import { logger } from '@/lib/utils/logger'
import { TEMP_FARM_ID } from '@/lib/auth/config'

interface Species {
  id: string
  name: string
}

interface UseSpeciesResult {
  species: Species[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useSpecies(): UseSpeciesResult {
  const [species, setSpecies] = useState<Species[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSpecies = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const preferences = await speciesPreferencesService.getAll(TEMP_FARM_ID)
      // Mapper les préférences vers un format simple { id, name }
      const speciesList: Species[] = preferences
        .filter(p => p.isActive)
        .map(p => ({
          id: p.speciesId,
          name: p.species?.nameFr || p.species?.nameEn || p.speciesId,
        }))
      setSpecies(speciesList)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch species preferences in hook', { error })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSpecies()
  }, [fetchSpecies])

  return {
    species,
    loading,
    error,
    refetch: fetchSpecies,
  }
}
