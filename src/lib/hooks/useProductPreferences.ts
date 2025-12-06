/**
 * Hook React pour la gestion des préférences de produits par ferme
 */

import { useState, useEffect, useCallback } from 'react'
import { ProductPreference } from '@/lib/types/product-preference'
import { productPreferencesService } from '@/lib/services/product-preferences.service'
import { logger } from '@/lib/utils/logger'

interface UseProductPreferencesResult {
  preferences: ProductPreference[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  savePreferences: (productIds: string[]) => Promise<void>
}

export function useProductPreferences(farmId: string | undefined): UseProductPreferencesResult {
  const [preferences, setPreferences] = useState<ProductPreference[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPreferences = useCallback(async () => {
    if (!farmId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await productPreferencesService.getAll(farmId, false)
      setPreferences(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch product preferences in hook', { error, farmId })
    } finally {
      setLoading(false)
    }
  }, [farmId])

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  const savePreferences = useCallback(async (productIds: string[]) => {
    if (!farmId) return

    try {
      await productPreferencesService.saveBatch(farmId, productIds)
      await fetchPreferences()
    } catch (err) {
      const error = err as Error
      logger.error('Failed to save product preferences', { error, farmId })
      throw error
    }
  }, [farmId, fetchPreferences])

  return {
    preferences,
    loading,
    error,
    refetch: fetchPreferences,
    savePreferences,
  }
}
