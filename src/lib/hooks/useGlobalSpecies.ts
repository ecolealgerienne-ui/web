/**
 * Hook React pour la gestion des espèces globales
 * Utilise l'endpoint /api/v1/species pour afficher toutes les espèces disponibles
 */

import { useState, useEffect, useCallback } from 'react'
import { Species } from '@/lib/types/admin/species'
import { speciesService } from '@/lib/services/admin/species.service'
import { logger } from '@/lib/utils/logger'

interface UseGlobalSpeciesResult {
  species: Species[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useGlobalSpecies(): UseGlobalSpeciesResult {
  const [species, setSpecies] = useState<Species[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSpecies = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Récupérer toutes les espèces actives
      const response = await speciesService.getAll({ limit: 100 })
      // Filtrer pour ne garder que les espèces actives
      const activeSpecies = response.data.filter(s => s.isActive !== false)
      setSpecies(activeSpecies)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch global species in hook', { error })
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
