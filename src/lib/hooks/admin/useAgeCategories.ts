'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/contexts/toast-context'
import { useTranslations } from 'next-intl'
import {
  ageCategoriesService,
  type AgeCategoryFilterParams,
} from '@/lib/services/admin/age-categories.service'
import { handleApiError } from '@/lib/utils/api-error-handler'
import type {
  AgeCategory,
  CreateAgeCategoryDto,
  UpdateAgeCategoryDto,
} from '@/lib/types/admin/age-category'

/**
 * Hook personnalisé pour gérer les catégories d'âge
 *
 * ✅ RÈGLE #6 : i18n pour tous les messages
 * ✅ RÈGLE #7 : Gestion d'erreurs avec handleApiError
 *
 * @param initialParams - Paramètres de pagination et filtres initiaux
 * @returns État et fonctions CRUD pour les catégories d'âge
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
 * } = useAgeCategories({ page: 1, limit: 25, speciesId: 'uuid' })
 * ```
 */
export function useAgeCategories(initialParams?: AgeCategoryFilterParams) {
  const toast = useToast()
  const t = useTranslations('ageCategory')
  const tc = useTranslations('common')

  // État local
  const [data, setData] = useState<AgeCategory[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [params, setParams] = useState<AgeCategoryFilterParams>(
    initialParams || {
      page: 1,
      limit: 25,
      sortBy: 'displayOrder',
      sortOrder: 'asc',
    }
  )

  // Ref pour empêcher les appels concurrents (ne déclenche pas de re-render)
  const isFetchingRef = useRef(false)

  /**
   * Charge les catégories d'âge avec les paramètres actuels
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
      const response = await ageCategoriesService.getAll(params)
      setData(response.data)
      setTotal(response.meta.total)
    } catch (err) {
      setError(err as Error)
      handleApiError(err, 'fetch age categories', toast)
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [params, toast])

  /**
   * Crée une nouvelle catégorie d'âge
   *
   * @param dto - Données de la catégorie d'âge à créer
   * @returns Catégorie d'âge créée
   */
  const create = useCallback(
    async (dto: CreateAgeCategoryDto) => {
      try {
        const ageCategory = await ageCategoriesService.create(dto)
        toast.success(tc('messages.success'), t('messages.created'))
        await fetchData()
        return ageCategory
      } catch (err) {
        handleApiError(err, 'create age category', toast, {
          409: t('messages.createError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Met à jour une catégorie d'âge existante
   *
   * @param id - ID de la catégorie d'âge
   * @param dto - Données à mettre à jour (doit inclure version)
   * @returns Catégorie d'âge mise à jour
   */
  const update = useCallback(
    async (id: string, dto: UpdateAgeCategoryDto) => {
      try {
        const ageCategory = await ageCategoriesService.update(id, dto)
        toast.success(tc('messages.success'), t('messages.updated'))
        await fetchData()
        return ageCategory
      } catch (err) {
        handleApiError(err, 'update age category', toast, {
          409: t('messages.updateError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Supprime une catégorie d'âge (soft delete)
   *
   * @param id - ID de la catégorie d'âge à supprimer
   */
  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await ageCategoriesService.delete(id)
        toast.success(tc('messages.success'), t('messages.deleted'))
        await fetchData()
      } catch (err) {
        handleApiError(err, 'delete age category', toast, {
          409: t('messages.deleteError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Restaure une catégorie d'âge supprimée
   *
   * @param id - ID de la catégorie d'âge à restaurer
   * @returns Catégorie d'âge restaurée
   */
  const restore = useCallback(
    async (id: string) => {
      try {
        const ageCategory = await ageCategoriesService.restore(id)
        toast.success(tc('messages.success'), t('messages.restored'))
        await fetchData()
        return ageCategory
      } catch (err) {
        handleApiError(err, 'restore age category', toast)
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
