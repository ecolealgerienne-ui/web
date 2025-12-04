/**
 * Hook React pour la gestion des vétérinaires
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Veterinarian, CreateVeterinarianDto } from '@/lib/types/veterinarian'
import { veterinariansService, VeterinarianFilters } from '@/lib/services/veterinarians.service'
import { logger } from '@/lib/utils/logger'

interface UseVeterinariansResult {
  veterinarians: Veterinarian[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  createVeterinarian: (data: CreateVeterinarianDto) => Promise<Veterinarian>
  deleteVeterinarian: (id: string) => Promise<void>
}

export function useVeterinarians(farmId: string | undefined, filters?: VeterinarianFilters): UseVeterinariansResult {
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
    if (!farmId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await veterinariansService.getAll(farmId, memoizedFilters)
      setVeterinarians(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch veterinarians in hook', { error, farmId })
    } finally {
      setLoading(false)
    }
  }, [farmId, memoizedFilters])

  useEffect(() => {
    fetchVeterinarians()
  }, [fetchVeterinarians])

  const createVeterinarian = useCallback(async (data: CreateVeterinarianDto): Promise<Veterinarian> => {
    if (!farmId) throw new Error('farmId is required')
    const newVet = await veterinariansService.create(farmId, data)
    setVeterinarians(prev => [...prev, newVet])
    return newVet
  }, [farmId])

  const deleteVeterinarian = useCallback(async (id: string): Promise<void> => {
    if (!farmId) throw new Error('farmId is required')
    await veterinariansService.delete(farmId, id)
    setVeterinarians(prev => prev.filter(v => v.id !== id))
  }, [farmId])

  return {
    veterinarians,
    loading,
    error,
    refetch: fetchVeterinarians,
    createVeterinarian,
    deleteVeterinarian,
  }
}
