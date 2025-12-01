/**
 * Hook personnalisé pour gérer les vétérinaires (Admin Reference Data)
 *
 * ✅ RÈGLE #6 : i18n pour tous les messages
 * ✅ RÈGLE #7 : Gestion d'erreurs avec handleApiError
 *
 * @param initialParams - Paramètres de pagination initiaux
 * @returns État et fonctions CRUD pour les vétérinaires
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
 * } = useVeterinarians({ page: 1, limit: 25 })
 * ```
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/contexts/toast-context'
import { useTranslations } from 'next-intl'
import { veterinariansService } from '@/lib/services/admin/veterinarians.service'
import { handleApiError } from '@/lib/utils/api-error-handler'
import type {
  Veterinarian,
  CreateVeterinarianDto,
  UpdateVeterinarianDto,
  VeterinarianFilterParams,
} from '@/lib/types/admin/veterinarian'

export function useVeterinarians(initialParams?: VeterinarianFilterParams) {
  const toast = useToast()
  const t = useTranslations('veterinarian')
  const tc = useTranslations('common')

  // État local
  const [data, setData] = useState<Veterinarian[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [params, setParams] = useState<VeterinarianFilterParams>(
    initialParams || {
      page: 1,
      limit: 25,
      sort: 'lastName',
      order: 'asc',
    }
  )

  // Ref pour empêcher les appels concurrents (ne déclenche pas de re-render)
  const isFetchingRef = useRef(false)

  /**
   * Charge les vétérinaires avec les paramètres actuels
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
      const response = await veterinariansService.getAll(params)
      setData(response.data)
      setTotal(response.meta.total)
    } catch (err) {
      setError(err as Error)
      handleApiError(err, 'fetch veterinarians', toast)
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [params, toast])

  /**
   * Crée un nouveau vétérinaire
   *
   * @param dto - Données du vétérinaire à créer
   * @returns Vétérinaire créé
   */
  const create = useCallback(
    async (dto: CreateVeterinarianDto) => {
      try {
        const veterinarian = await veterinariansService.create(dto)
        toast.success(tc('messages.success'), t('messages.created'))
        await fetchData()
        return veterinarian
      } catch (err) {
        handleApiError(err, 'create veterinarian', toast, {
          409: t('messages.createError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Met à jour un vétérinaire existant
   *
   * @param id - ID du vétérinaire
   * @param dto - Données à mettre à jour (doit inclure version)
   * @returns Vétérinaire mis à jour
   */
  const update = useCallback(
    async (id: string, dto: UpdateVeterinarianDto) => {
      try {
        const veterinarian = await veterinariansService.update(id, dto)
        toast.success(tc('messages.success'), t('messages.updated'))
        await fetchData()
        return veterinarian
      } catch (err) {
        handleApiError(err, 'update veterinarian', toast, {
          409: t('messages.updateError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Supprime un vétérinaire (soft delete)
   *
   * @param id - ID du vétérinaire à supprimer
   */
  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await veterinariansService.delete(id)
        toast.success(tc('messages.success'), t('messages.deleted'))
        await fetchData()
      } catch (err) {
        handleApiError(err, 'delete veterinarian', toast, {
          409: t('messages.deleteError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Restaure un vétérinaire supprimé
   *
   * @param id - ID du vétérinaire à restaurer
   * @returns Vétérinaire restauré
   */
  const restore = useCallback(
    async (id: string) => {
      try {
        const veterinarian = await veterinariansService.restore(id)
        toast.success(tc('messages.success'), t('messages.restored'))
        await fetchData()
        return veterinarian
      } catch (err) {
        handleApiError(err, 'restore veterinarian', toast)
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
