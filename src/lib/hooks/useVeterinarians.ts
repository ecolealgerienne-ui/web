/**
 * Hook React pour la gestion des vétérinaires
 */

import { useState, useEffect, useCallback } from 'react'
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

export function useVeterinarians(filters?: VeterinarianFilters): UseVeterinariansResult {
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchVeterinarians = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await veterinariansService.getAll(filters)
      setVeterinarians(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch veterinarians in hook', { error })
    } finally {
      setLoading(false)
    }
  }, [filters?.isActive, filters?.search, filters?.region, filters?.specialties])

  useEffect(() => {
    fetchVeterinarians()
  }, [fetchVeterinarians])

  const createVeterinarian = useCallback(async (data: CreateVeterinarianDto): Promise<Veterinarian> => {
    const newVet = await veterinariansService.create(data)
    setVeterinarians(prev => [...prev, newVet])
    return newVet
  }, [])

  const deleteVeterinarian = useCallback(async (id: string): Promise<void> => {
    await veterinariansService.delete(id)
    setVeterinarians(prev => prev.filter(v => v.id !== id))
  }, [])

  return {
    veterinarians,
    loading,
    error,
    refetch: fetchVeterinarians,
    createVeterinarian,
    deleteVeterinarian,
  }
}
