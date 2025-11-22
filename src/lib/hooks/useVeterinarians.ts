/**
 * Hook React pour la gestion des vétérinaires
 */

import { useState, useEffect, useCallback } from 'react'
import { Veterinarian } from '@/lib/types/veterinarian'
import { veterinariansService } from '@/lib/services/veterinarians.service'
import { logger } from '@/lib/utils/logger'

interface UseVeterinariansResult {
  veterinarians: Veterinarian[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useVeterinarians(isActive?: boolean): UseVeterinariansResult {
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchVeterinarians = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await veterinariansService.getAll({ isActive })
      setVeterinarians(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch veterinarians in hook', { error })
    } finally {
      setLoading(false)
    }
  }, [isActive])

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
