'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/contexts/toast-context'
import { useTranslations } from 'next-intl'
import { speciesService } from '@/lib/services/admin/species.service'
import { handleApiError } from '@/lib/utils/api-error-handler'
import type {
  Species,
  CreateSpeciesDto,
  UpdateSpeciesDto,
} from '@/lib/types/admin/species'
import type { PaginationParams } from '@/lib/types/common/api'

/**
 * Hook personnalisé pour gérer les espèces animales
 *
 * ✅ RÈGLE #6 : i18n pour tous les messages
 * ✅ RÈGLE #7 : Gestion d'erreurs avec handleApiError
 *
 * @param initialParams - Paramètres de pagination initiaux
 * @returns État et fonctions CRUD pour les espèces
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
 * } = useSpecies({ page: 1, limit: 25 })
 * ```
 */
export function useSpecies(initialParams?: PaginationParams) {
  const toast = useToast()
  const t = useTranslations('species')
  const tc = useTranslations('common')

  // État local
  const [data, setData] = useState<Species[]>([])
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
   * Charge les espèces avec les paramètres actuels
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
      const response = await speciesService.getAll(params)
      setData(response.data)
      setTotal(response.meta.total)
    } catch (err) {
      setError(err as Error)
      handleApiError(err, 'fetch species', toast)
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [params, toast])

  /**
   * Crée une nouvelle espèce
   *
   * @param dto - Données de l'espèce à créer
   * @returns Espèce créée
   */
  const create = useCallback(
    async (dto: CreateSpeciesDto) => {
      try {
        const species = await speciesService.create(dto)
        toast.success(tc('messages.success'), t('messages.created'))
        await fetchData()
        return species
      } catch (err) {
        handleApiError(err, 'create species', toast, {
          409: t('messages.createError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Met à jour une espèce existante
   *
   * @param id - ID de l'espèce
   * @param dto - Données à mettre à jour (doit inclure version)
   * @returns Espèce mise à jour
   */
  const update = useCallback(
    async (id: string, dto: UpdateSpeciesDto) => {
      try {
        const species = await speciesService.update(id, dto)
        toast.success(tc('messages.success'), t('messages.updated'))
        await fetchData()
        return species
      } catch (err) {
        handleApiError(err, 'update species', toast, {
          409: t('messages.updateError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Supprime une espèce (soft delete)
   *
   * @param id - ID de l'espèce à supprimer
   */
  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await speciesService.delete(id)
        toast.success(tc('messages.success'), t('messages.deleted'))
        await fetchData()
      } catch (err) {
        handleApiError(err, 'delete species', toast, {
          409: t('messages.deleteError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Restaure une espèce supprimée
   *
   * @param id - ID de l'espèce à restaurer
   * @returns Espèce restaurée
   */
  const restore = useCallback(
    async (id: string) => {
      try {
        const species = await speciesService.restore(id)
        toast.success(tc('messages.success'), t('messages.restored'))
        await fetchData()
        return species
      } catch (err) {
        handleApiError(err, 'restore species', toast)
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
