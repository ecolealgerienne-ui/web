/**
 * Hook React pour la gestion des vétérinaires globaux
 * Utilise l'endpoint /api/v1/veterinarians pour afficher tous les vétérinaires disponibles
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Veterinarian } from '@/lib/types/veterinarian'
import { veterinariansService, VeterinarianFilters } from '@/lib/services/veterinarians.service'
import { logger } from '@/lib/utils/logger'

interface UseGlobalVeterinariansResult {
  veterinarians: Veterinarian[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useGlobalVeterinarians(filters?: VeterinarianFilters): UseGlobalVeterinariansResult {
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Extraire les valeurs des filtres pour éviter les re-renders inutiles
  const filterSearch = filters?.search
  const filterScope = filters?.scope
  const filterDepartment = filters?.department
  const filterIsActive = filters?.isActive
  const filterIsAvailable = filters?.isAvailable
  const filterEmergencyService = filters?.emergencyService
  const filterPage = filters?.page
  const filterLimit = filters?.limit
  const filterSort = filters?.sort
  const filterOrder = filters?.order

  const memoizedFilters = useMemo(() => ({
    search: filterSearch,
    scope: filterScope,
    department: filterDepartment,
    isActive: filterIsActive,
    isAvailable: filterIsAvailable,
    emergencyService: filterEmergencyService,
    page: filterPage,
    limit: filterLimit,
    sort: filterSort,
    order: filterOrder,
  }), [filterSearch, filterScope, filterDepartment, filterIsActive, filterIsAvailable, filterEmergencyService, filterPage, filterLimit, filterSort, filterOrder])

  const fetchVeterinarians = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await veterinariansService.getAllGlobal(memoizedFilters)
      setVeterinarians(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch global veterinarians in hook', { error })
    } finally {
      setLoading(false)
    }
  }, [memoizedFilters])

  useEffect(() => {
    fetchVeterinarians()
  }, [fetchVeterinarians])

  return {
    veterinarians,
    loading,
    error,
    refetch: fetchVeterinarians,
  }
}
