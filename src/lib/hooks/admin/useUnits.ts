'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { unitsService } from '@/lib/services/admin/units.service'
import { useToast } from '@/lib/hooks/useToast'
import { handleApiError } from '@/lib/utils/api-error-handler'
import type { Unit, CreateUnitDto, UpdateUnitDto } from '@/lib/types/admin/unit'
import type { PaginationParams } from '@/lib/types/common/api'

/**
 * Hook pour gérer les unités de mesure
 *
 * ✅ RÈGLE #6 : Messages i18n
 * ✅ RÈGLE #7 : Utilise logger (via service)
 * ✅ RÈGLE #8.3.11 : useRef pour protection contre appels concurrents
 *
 * @example
 * ```typescript
 * function UnitsPage() {
 *   const { data, loading, create, update, delete: deleteUnit } = useUnits()
 *
 *   // ... utilisation dans le composant
 * }
 * ```
 */
export function useUnits(initialParams?: PaginationParams) {
  const toast = useToast()
  const t = useTranslations('unit')

  // État
  const [data, setData] = useState<Unit[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [params, setParams] = useState<PaginationParams>(
    initialParams || {
      page: 1,
      limit: 25,
      sortBy: 'name',
      sortOrder: 'asc',
    }
  )

  // ✅ RÈGLE #8.3.11 : Protection contre appels API concurrents
  // Utiliser useRef (pas useState) pour éviter les re-renders inutiles
  const isFetchingRef = useRef(false)

  /**
   * Récupère les unités
   *
   * ✅ RÈGLE #8.3.11 : Protégé contre appels concurrents
   */
  const fetchData = useCallback(async () => {
    // Guard : Si déjà en cours de fetch, ne rien faire
    if (isFetchingRef.current) {
      return
    }

    isFetchingRef.current = true
    setLoading(true)

    try {
      const response = await unitsService.getAll(params)
      setData(response.data)
      setTotal(response.meta.total)
    } catch (err) {
      handleApiError(err, 'fetch units', toast)
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [params, toast])

  // Charger les données au montage et quand params change
  useEffect(() => {
    fetchData()
  }, [fetchData])

  /**
   * Crée une nouvelle unité
   */
  const create = useCallback(
    async (dto: CreateUnitDto): Promise<Unit | null> => {
      try {
        const unit = await unitsService.create(dto)
        toast.success(t('messages.created'))
        await fetchData() // Recharger la liste
        return unit
      } catch (err) {
        handleApiError(err, 'create unit', toast)
        return null
      }
    },
    [fetchData, toast, t]
  )

  /**
   * Met à jour une unité existante
   */
  const update = useCallback(
    async (id: string, dto: UpdateUnitDto): Promise<Unit | null> => {
      try {
        const unit = await unitsService.update(id, dto)
        toast.success(t('messages.updated'))
        await fetchData() // Recharger la liste
        return unit
      } catch (err) {
        handleApiError(err, 'update unit', toast)
        return null
      }
    },
    [fetchData, toast, t]
  )

  /**
   * Supprime une unité (soft delete)
   */
  const deleteItem = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await unitsService.delete(id)
        toast.success(t('messages.deleted'))
        await fetchData() // Recharger la liste
        return true
      } catch (err) {
        handleApiError(err, 'delete unit', toast)
        return false
      }
    },
    [fetchData, toast, t]
  )

  /**
   * Restaure une unité supprimée
   */
  const restore = useCallback(
    async (id: string): Promise<Unit | null> => {
      try {
        const unit = await unitsService.restore(id)
        toast.success(t('messages.restored'))
        await fetchData() // Recharger la liste
        return unit
      } catch (err) {
        handleApiError(err, 'restore unit', toast)
        return null
      }
    },
    [fetchData, toast, t]
  )

  return {
    // Données
    data,
    total,
    loading,

    // Params de pagination
    params,
    setParams,

    // Actions CRUD
    create,
    update,
    delete: deleteItem,
    restore,

    // Refresh manuel
    refetch: fetchData,
  }
}
