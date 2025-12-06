/**
 * Hook React pour la gestion des races globales
 * Utilise l'endpoint /api/v1/breeds pour afficher les races filtrées par espèce
 */

import { useState, useEffect, useCallback } from 'react'
import { Breed } from '@/lib/types/admin/breed'
import { breedsService } from '@/lib/services/admin/breeds.service'
import { logger } from '@/lib/utils/logger'

interface UseGlobalBreedsResult {
  breeds: Breed[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useGlobalBreeds(speciesId?: string): UseGlobalBreedsResult {
  const [breeds, setBreeds] = useState<Breed[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchBreeds = useCallback(async () => {
    if (!speciesId) {
      setBreeds([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Récupérer les races pour l'espèce spécifiée
      const response = await breedsService.getAll({
        speciesId,
        limit: 100,
        isActive: true,
      })

      setBreeds(response.data)
      logger.info('Global breeds fetched successfully', {
        speciesId,
        count: response.data.length
      })
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch global breeds in hook', { error, speciesId })
    } finally {
      setLoading(false)
    }
  }, [speciesId])

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
