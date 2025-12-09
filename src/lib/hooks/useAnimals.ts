/**
 * Hook React pour la gestion des animaux
 *
 * Conforme aux normes DEVELOPMENT_STANDARDS.md (règle 7.7)
 * - Utilise params/setParams pour la gestion d'état
 * - Retourne total pour la pagination
 */

import { useState, useEffect, useCallback } from 'react'
import { Animal } from '@/lib/types/animal'
import { animalsService, AnimalFilterParams } from '@/lib/services/animals.service'
import { logger } from '@/lib/utils/logger'

interface UseAnimalsResult {
  /** Liste des animaux */
  animals: Animal[]
  /** Nombre total d'animaux (pour pagination) */
  total: number
  /** État de chargement */
  loading: boolean
  /** Erreur éventuelle */
  error: Error | null
  /** Paramètres de filtre actuels */
  params: AnimalFilterParams
  /** Mettre à jour les paramètres de filtre */
  setParams: React.Dispatch<React.SetStateAction<AnimalFilterParams>>
  /** Recharger les données */
  refetch: () => Promise<void>
}

const DEFAULT_PARAMS: AnimalFilterParams = {
  page: 1,
  limit: 25,
  status: 'all',
  search: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
}

export function useAnimals(initialParams?: Partial<AnimalFilterParams>): UseAnimalsResult {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [params, setParams] = useState<AnimalFilterParams>({
    ...DEFAULT_PARAMS,
    ...initialParams,
  })

  const fetchAnimals = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await animalsService.getAll(params)
      setAnimals(response.data)
      setTotal(response.meta.total)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch animals in hook', { error, params })
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchAnimals()
  }, [fetchAnimals])

  return {
    animals,
    total,
    loading,
    error,
    params,
    setParams,
    refetch: fetchAnimals,
  }
}
