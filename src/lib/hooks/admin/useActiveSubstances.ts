'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/contexts/toast-context'
import { useTranslations } from 'next-intl'
import { activeSubstancesService } from '@/lib/services/admin/active-substances.service'
import { handleApiError } from '@/lib/utils/api-error-handler'
import type {
  ActiveSubstance,
  CreateActiveSubstanceDto,
  UpdateActiveSubstanceDto,
} from '@/lib/types/admin/active-substance'
import type { PaginationParams } from '@/lib/types/common/api'

/**
 * Hook personnalisé pour gérer les substances actives
 *
 * ✅ RÈGLE #6 : i18n pour tous les messages
 * ✅ RÈGLE #7 : Gestion d'erreurs avec handleApiError
 *
 * @param initialParams - Paramètres de pagination initiaux
 * @returns État et fonctions CRUD pour les substances actives
 *
 * @example
 * ```typescript
 * const {
 *   data,
 *   total,
 *   loading,
 *   params,
 *   setParams,
 *   create,
 *   update,
 *   delete: deleteItem,
 *   refetch
 * } = useActiveSubstances({ page: 1, limit: 25 })
 * ```
 */
export function useActiveSubstances(initialParams?: PaginationParams) {
  const toast = useToast()
  const t = useTranslations('activeSubstance')
  const tc = useTranslations('common')

  // État local
  const [data, setData] = useState<ActiveSubstance[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [params, setParams] = useState<PaginationParams>(
    initialParams || {
      page: 1,
      limit: 25,
      sortBy: 'name',
      sortOrder: 'asc',
    }
  )

  // Ref pour empêcher les appels concurrents (ne déclenche pas de re-render)
  const isFetchingRef = useRef(false)

  /**
   * Charge les substances actives avec les paramètres actuels
   */
  const fetchData = useCallback(async () => {
    // Empêcher les appels concurrents
    if (isFetchingRef.current) {
      return
    }

    isFetchingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const response = await activeSubstancesService.getAll(params)
      setData(response.data)
      setTotal(response.meta.total)
    } catch (err) {
      setError(err as Error)
      handleApiError(err, 'fetch active substances', toast)
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [params, toast])

  /**
   * Crée une nouvelle substance active
   *
   * @param dto - Données de la substance à créer
   * @returns Substance active créée
   */
  const create = useCallback(
    async (dto: CreateActiveSubstanceDto) => {
      try {
        const substance = await activeSubstancesService.create(dto)
        toast.success(tc('messages.success'), t('messages.created'))
        await fetchData()
        return substance
      } catch (err) {
        handleApiError(err, 'create active substance', toast, {
          409: t('messages.createError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Met à jour une substance active existante
   *
   * @param id - ID de la substance
   * @param dto - Données à mettre à jour (doit inclure version)
   * @returns Substance active mise à jour
   */
  const update = useCallback(
    async (id: string, dto: UpdateActiveSubstanceDto) => {
      try {
        const substance = await activeSubstancesService.update(id, dto)
        toast.success(tc('messages.success'), t('messages.updated'))
        await fetchData()
        return substance
      } catch (err) {
        handleApiError(err, 'update active substance', toast, {
          409: t('messages.updateError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Supprime une substance active (soft delete)
   *
   * @param id - ID de la substance à supprimer
   */
  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await activeSubstancesService.delete(id)
        toast.success(tc('messages.success'), t('messages.deleted'))
        await fetchData()
      } catch (err) {
        handleApiError(err, 'delete active substance', toast, {
          409: t('messages.deleteError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Restaure une substance active supprimée
   *
   * @param id - ID de la substance à restaurer
   * @returns Substance active restaurée
   */
  const restore = useCallback(
    async (id: string) => {
      try {
        const substance = await activeSubstancesService.restore(id)
        toast.success(tc('messages.success'), t('messages.restored'))
        await fetchData()
        return substance
      } catch (err) {
        handleApiError(err, 'restore active substance', toast)
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Charge les données au montage et quand params changent
   */
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    // État
    data,
    total,
    loading,
    error,
    params,

    // Fonctions de mutation de paramètres
    setParams,

    // Fonctions CRUD
    create,
    update,
    delete: deleteItem,
    restore,
    refetch: fetchData,
  }
}
