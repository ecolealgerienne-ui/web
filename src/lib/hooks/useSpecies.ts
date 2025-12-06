/**
 * Hook React pour la gestion des espèces (READ-ONLY pour pages transactionnelles)
 * Utilise @/lib/i18n pour les traductions
 */

import { useState, useEffect, useCallback } from 'react'
import { speciesService } from '@/lib/services/admin/species.service'
import { logger } from '@/lib/utils/logger'
import type { Species } from '@/lib/types/admin/species'

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
      const response = await speciesService.getAll({ limit: 100 })
      // Filtrer uniquement les espèces actives
      const activeSpecies = response.data.filter(s => s.isActive !== false)
      setSpecies(activeSpecies)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch species in hook', { error })
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
