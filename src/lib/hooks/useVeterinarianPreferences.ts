/**
 * Hook React pour la gestion des préférences de vétérinaires par ferme
 */

import { useState, useEffect, useCallback } from 'react'
import { VeterinarianPreference } from '@/lib/types/veterinarian-preference'
import { veterinarianPreferencesService } from '@/lib/services/veterinarian-preferences.service'
import { logger } from '@/lib/utils/logger'

interface UseVeterinarianPreferencesResult {
  preferences: VeterinarianPreference[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  savePreferences: (veterinarianIds: string[]) => Promise<void>
}

export function useVeterinarianPreferences(farmId: string | undefined): UseVeterinarianPreferencesResult {
  const [preferences, setPreferences] = useState<VeterinarianPreference[]>([])
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
      const data = await veterinarianPreferencesService.getAll(farmId, false)
      setPreferences(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch veterinarian preferences in hook', { error, farmId })
    } finally {
      setLoading(false)
    }
  }, [farmId])

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  const savePreferences = useCallback(async (veterinarianIds: string[]) => {
    if (!farmId) return

    try {
      // TODO: Pour l'instant on supprime tout et on recrée
      // À améliorer avec un vrai endpoint de batch update
      await veterinarianPreferencesService.saveBatch(farmId, veterinarianIds)
      await fetchPreferences()
    } catch (err) {
      const error = err as Error
      logger.error('Failed to save veterinarian preferences', { error, farmId })
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
