/**
 * Hook React pour la gestion des vétérinaires
 */

import { useState, useEffect, useCallback } from 'react'
import { Veterinarian } from '@/lib/types/veterinarian'
import { veterinariansService, VeterinarianFilters } from '@/lib/services/veterinarians.service'
import { logger } from '@/lib/utils/logger'

interface UseVeterinariansResult {
  veterinarians: Veterinarian[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useVeterinarians(filters?: Partial<VeterinarianFilters>): UseVeterinariansResult {
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchVeterinarians = useCallback(async () => {
    logger.info('useVeterinarians: Starting fetch', { filters })
    setLoading(true)
    setError(null)

    try {
      const data = await veterinariansService.getAll(filters)
      logger.info('useVeterinarians: Data received', { count: data.length, data })
      setVeterinarians(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch veterinarians in hook', { error: error.message, stack: error.stack })
    } finally {
      setLoading(false)
      logger.info('useVeterinarians: Fetch completed')
    }
  }, [filters?.search, filters?.isActive, filters?.isAvailable, filters?.emergencyService])

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
