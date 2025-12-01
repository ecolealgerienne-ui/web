'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/contexts/toast-context'
import { useTranslations } from 'next-intl'
import { countriesService } from '@/lib/services/admin/countries.service'
import { handleApiError } from '@/lib/utils/api-error-handler'
import type {
  Country,
  CreateCountryDto,
  UpdateCountryDto,
} from '@/lib/types/admin/country'
import type { PaginationParams } from '@/lib/types/common/api'

/**
 * Hook personnalisé pour gérer les pays
 *
 * ✅ RÈGLE #6 : i18n pour tous les messages
 * ✅ RÈGLE #7 : Gestion d'erreurs avec handleApiError
 *
 * @param initialParams - Paramètres de pagination initiaux
 * @returns État et fonctions CRUD pour les pays
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
 * } = useCountries({ page: 1, limit: 25 })
 * ```
 */
export function useCountries(initialParams?: PaginationParams) {
  const toast = useToast()
  const t = useTranslations('country')
  const tc = useTranslations('common')

  // État local
  const [data, setData] = useState<Country[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [params, setParams] = useState<PaginationParams>(
    initialParams || {
      page: 1,
      limit: 25,
      sortBy: 'nameFr',
      sortOrder: 'asc',
    }
  )

  // Ref pour empêcher les appels concurrents (ne déclenche pas de re-render)
  const isFetchingRef = useRef(false)

  /**
   * Charge les pays avec les paramètres actuels
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
      const response = await countriesService.getAll(params)
      setData(response.data)
      setTotal(response.meta.total)
    } catch (err) {
      setError(err as Error)
      handleApiError(err, 'fetch countries', toast)
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [params, toast])

  /**
   * Crée un nouveau pays
   *
   * @param dto - Données du pays à créer
   * @returns Pays créé
   */
  const create = useCallback(
    async (dto: CreateCountryDto) => {
      try {
        const country = await countriesService.create(dto)
        toast.success(tc('messages.success'), t('messages.created'))
        await fetchData()
        return country
      } catch (err) {
        handleApiError(err, 'create country', toast, {
          409: t('messages.createError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Met à jour un pays existant
   *
   * @param id - ID du pays
   * @param dto - Données à mettre à jour (doit inclure version)
   * @returns Pays mis à jour
   */
  const update = useCallback(
    async (id: string, dto: UpdateCountryDto) => {
      try {
        const country = await countriesService.update(id, dto)
        toast.success(tc('messages.success'), t('messages.updated'))
        await fetchData()
        return country
      } catch (err) {
        handleApiError(err, 'update country', toast, {
          409: t('messages.updateError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Supprime un pays (soft delete)
   *
   * @param id - ID du pays à supprimer
   */
  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await countriesService.delete(id)
        toast.success(tc('messages.success'), t('messages.deleted'))
        await fetchData()
      } catch (err) {
        handleApiError(err, 'delete country', toast, {
          409: t('messages.deleteError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Restaure un pays supprimé
   *
   * @param id - ID du pays à restaurer
   * @returns Pays restauré
   */
  const restore = useCallback(
    async (id: string) => {
      try {
        const country = await countriesService.restore(id)
        toast.success(tc('messages.success'), t('messages.restored'))
        await fetchData()
        return country
      } catch (err) {
        handleApiError(err, 'restore country', toast)
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
