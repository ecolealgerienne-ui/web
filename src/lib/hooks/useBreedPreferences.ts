/**
 * Hook React pour la gestion des préférences de races par ferme
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { BreedPreference } from '@/lib/types/breed-preference'
import { breedPreferencesService } from '@/lib/services/breed-preferences.service'
import { logger } from '@/lib/utils/logger'

interface UseBreedPreferencesResult {
  preferences: BreedPreference[]
  /** Préférences filtrées par espèce */
  preferencesBySpecies: (speciesId: string) => BreedPreference[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  savePreferences: (breedIds: string[]) => Promise<void>
}

export function useBreedPreferences(farmId: string | undefined): UseBreedPreferencesResult {
  const [preferences, setPreferences] = useState<BreedPreference[]>([])
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
      const data = await breedPreferencesService.getAll(farmId, false)
      setPreferences(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch breed preferences in hook', { error, farmId })
    } finally {
      setLoading(false)
    }
  }, [farmId])

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  const preferencesBySpecies = useCallback((speciesId: string) => {
    return preferences.filter(p => p.breed?.speciesId === speciesId)
  }, [preferences])

  const savePreferences = useCallback(async (breedIds: string[]) => {
    if (!farmId) return

    try {
      await breedPreferencesService.saveBatch(farmId, breedIds)
      await fetchPreferences()
    } catch (err) {
      const error = err as Error
      logger.error('Failed to save breed preferences', { error, farmId })
      throw error
    }
  }, [farmId, fetchPreferences])

  return {
    preferences,
    preferencesBySpecies,
    loading,
    error,
    refetch: fetchPreferences,
    savePreferences,
  }
}
