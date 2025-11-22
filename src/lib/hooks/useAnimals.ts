/**
 * Hook React pour la gestion des animaux
 *
 * Utilise le service animals.service.ts et gère l'état local
 */

import { useState, useEffect, useCallback } from 'react'
import { Animal, AnimalFilters } from '@/lib/types/animal'
import { animalsService } from '@/lib/services/animals.service'
import { useToast } from '@/contexts/toast-context'
import { logger } from '@/lib/utils/logger'

interface UseAnimalsResult {
  animals: Animal[]
  loading: boolean
  error: Error | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  refetch: () => Promise<void>
  setPage: (page: number) => void
  setFilters: (filters: AnimalFilters) => void
}

export function useAnimals(initialFilters: AnimalFilters = {}, initialPage = 1, initialLimit = 50): UseAnimalsResult {
  const toast = useToast()
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(initialPage)
  const [filters, setFilters] = useState<AnimalFilters>(initialFilters)
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  })

  const fetchAnimals = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await animalsService.getAll(filters, page, initialLimit)
      setAnimals(response.data)
      setPagination(response.pagination)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch animals in hook', { error })
      toast.error('Erreur', 'Impossible de charger les animaux')
    } finally {
      setLoading(false)
    }
  }, [filters, page, initialLimit]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchAnimals()
  }, [fetchAnimals])

  return {
    animals,
    loading,
    error,
    pagination,
    refetch: fetchAnimals,
    setPage,
    setFilters,
  }
}

/**
 * Hook pour récupérer un animal par ID
 */
export function useAnimal(id: string | null) {
  const toast = useToast()
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAnimal = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await animalsService.getById(id)
      setAnimal(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch animal in hook', { error, animalId: id })
      toast.error('Erreur', 'Impossible de charger l\'animal')
    } finally {
      setLoading(false)
    }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchAnimal()
  }, [fetchAnimal])

  return {
    animal,
    loading,
    error,
    refetch: fetchAnimal,
  }
}
