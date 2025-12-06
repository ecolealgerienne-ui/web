/**
 * Hook React pour la gestion des espèces globales
 * Utilise l'endpoint /api/v1/species pour afficher toutes les espèces disponibles
 */

import { useState, useEffect, useCallback } from 'react'
import { Species } from '@/lib/types/admin/species'
import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'

/**
 * Structure retournée par l'API backend pour les espèces
 * L'API retourne nameFr/nameEn/nameAr au lieu d'un simple name
 */
interface ApiSpecies {
  id: string
  nameFr: string
  nameEn: string
  nameAr: string
  icon?: string
  scientificName?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

/**
 * Mapper une espèce API vers le type frontend Species
 */
function mapApiSpeciesToSpecies(apiSpecies: ApiSpecies): Species {
  return {
    id: apiSpecies.id,
    code: apiSpecies.id.toUpperCase(), // Utiliser l'id comme code
    name: apiSpecies.nameFr, // Utiliser le nom français
    description: apiSpecies.scientificName,
    isActive: apiSpecies.isActive ?? true,
    createdAt: apiSpecies.createdAt,
    updatedAt: apiSpecies.updatedAt,
  }
}

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
      // Récupérer toutes les espèces depuis l'API
      // L'API retourne { data: ApiSpecies[], meta: {...} }
      const response = await apiClient.get<{ data: ApiSpecies[]; meta: any }>('/api/v1/species?limit=100')

      // Mapper les espèces API vers le type frontend
      const mappedSpecies = response.data
        .filter(s => s.isActive !== false)
        .map(mapApiSpeciesToSpecies)

      setSpecies(mappedSpecies)
      logger.info('Global species fetched successfully', { count: mappedSpecies.length })
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
