'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/contexts/toast-context'
import { useTranslations } from 'next-intl'
import { administrationRoutesService } from '@/lib/services/admin/administration-routes.service'
import { handleApiError } from '@/lib/utils/api-error-handler'
import type {
  AdministrationRoute,
  CreateAdministrationRouteDto,
  UpdateAdministrationRouteDto,
} from '@/lib/types/admin/administration-route'
import type { PaginationParams } from '@/lib/types/common/api'

/**
 * Hook personnalisé pour gérer les voies d'administration
 *
 * ✅ RÈGLE #6 : i18n pour tous les messages
 * ✅ RÈGLE #7 : Gestion d'erreurs avec handleApiError
 *
 * @param initialParams - Paramètres de pagination initiaux
 * @returns État et fonctions CRUD pour les voies d'administration
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
 * } = useAdministrationRoutes({ page: 1, limit: 25 })
 * ```
 */
export function useAdministrationRoutes(initialParams?: PaginationParams) {
  const toast = useToast()
  const t = useTranslations('administrationRoute')
  const tc = useTranslations('common')

  // État local
  const [data, setData] = useState<AdministrationRoute[]>([])
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
   * Charge les voies d'administration avec les paramètres actuels
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
      const response = await administrationRoutesService.getAll(params)
      setData(response.data)
      setTotal(response.meta.total)
    } catch (err) {
      setError(err as Error)
      handleApiError(err, 'fetch administration routes', toast)
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [params, toast])

  /**
   * Crée une nouvelle voie d'administration
   *
   * @param dto - Données de la voie à créer
   * @returns Voie d'administration créée
   */
  const create = useCallback(
    async (dto: CreateAdministrationRouteDto) => {
      try {
        const route = await administrationRoutesService.create(dto)
        toast.success(tc('messages.success'), t('messages.created'))
        await fetchData()
        return route
      } catch (err) {
        handleApiError(err, 'create administration route', toast, {
          409: t('messages.createError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Met à jour une voie d'administration existante
   *
   * @param id - ID de la voie
   * @param dto - Données à mettre à jour (doit inclure version)
   * @returns Voie d'administration mise à jour
   */
  const update = useCallback(
    async (id: string, dto: UpdateAdministrationRouteDto) => {
      try {
        const route = await administrationRoutesService.update(id, dto)
        toast.success(tc('messages.success'), t('messages.updated'))
        await fetchData()
        return route
      } catch (err) {
        handleApiError(err, 'update administration route', toast, {
          409: t('messages.updateError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Supprime une voie d'administration (soft delete)
   *
   * @param id - ID de la voie à supprimer
   */
  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await administrationRoutesService.delete(id)
        toast.success(tc('messages.success'), t('messages.deleted'))
        await fetchData()
      } catch (err) {
        handleApiError(err, 'delete administration route', toast, {
          409: t('messages.deleteError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Restaure une voie d'administration supprimée
   *
   * @param id - ID de la voie à restaurer
   * @returns Voie d'administration restaurée
   */
  const restore = useCallback(
    async (id: string) => {
      try {
        const route = await administrationRoutesService.restore(id)
        toast.success(tc('messages.success'), t('messages.restored'))
        await fetchData()
        return route
      } catch (err) {
        handleApiError(err, 'restore administration route', toast)
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
