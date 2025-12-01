'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/contexts/toast-context'
import { useTranslations } from 'next-intl'
import { productCategoriesService } from '@/lib/services/admin/product-categories.service'
import { handleApiError } from '@/lib/utils/api-error-handler'
import type {
  ProductCategory,
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from '@/lib/types/admin/product-category'
import type { PaginationParams } from '@/lib/types/common/api'

/**
 * Hook personnalisé pour gérer les catégories de produits
 *
 * ✅ RÈGLE #6 : i18n pour tous les messages
 * ✅ RÈGLE #7 : Gestion d'erreurs avec handleApiError
 * ✅ RÈGLE #8.3.11 : Protection contre appels concurrents avec useRef
 *
 * @param initialParams - Paramètres de pagination et filtres initiaux
 * @returns État et fonctions CRUD pour les catégories
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
 * } = useProductCategories({ page: 1, limit: 25 })
 * ```
 */
export function useProductCategories(initialParams?: PaginationParams) {
  const toast = useToast()
  const t = useTranslations('productCategory')
  const tc = useTranslations('common')

  // État local
  const [data, setData] = useState<ProductCategory[]>([])
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

  // ✅ RÈGLE #8.3.11 : Ref pour empêcher les appels concurrents (ne déclenche pas de re-render)
  const isFetchingRef = useRef(false)

  /**
   * Charge les catégories avec les paramètres actuels
   *
   * ✅ RÈGLE #8.3.11 : Protection contre appels concurrents
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
      const response = await productCategoriesService.getAll(params)
      setData(response.data)
      setTotal(response.meta.total)
    } catch (err) {
      setError(err as Error)
      handleApiError(err, 'fetch product categories', toast)
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [params, toast])

  // Auto-fetch on mount and when params change
  useEffect(() => {
    fetchData()
  }, [fetchData])

  /**
   * Crée une nouvelle catégorie
   */
  const create = useCallback(
    async (dto: CreateProductCategoryDto): Promise<ProductCategory> => {
      try {
        const category = await productCategoriesService.create(dto)

        toast.success(
          tc('messages.created', { item: t('title.singular') })
        )

        // Recharger la liste
        fetchData()

        return category
      } catch (err) {
        handleApiError(err, 'create product category', toast)
        throw err
      }
    },
    [toast, t, tc, fetchData]
  )

  /**
   * Met à jour une catégorie existante
   */
  const update = useCallback(
    async (
      id: string,
      dto: UpdateProductCategoryDto
    ): Promise<ProductCategory> => {
      try {
        const category = await productCategoriesService.update(id, dto)

        toast.success(
          tc('messages.updated', { item: t('title.singular') })
        )

        // Recharger la liste
        fetchData()

        return category
      } catch (err) {
        handleApiError(err, 'update product category', toast)
        throw err
      }
    },
    [toast, t, tc, fetchData]
  )

  /**
   * Supprime une catégorie (soft delete)
   */
  const deleteItem = useCallback(
    async (id: string): Promise<void> => {
      try {
        await productCategoriesService.delete(id)

        toast.success(
          tc('messages.deleted', { item: t('title.singular') })
        )

        // Recharger la liste
        fetchData()
      } catch (err) {
        handleApiError(err, 'delete product category', toast)
        throw err
      }
    },
    [toast, t, tc, fetchData]
  )

  /**
   * Restaure une catégorie supprimée
   */
  const restore = useCallback(
    async (id: string): Promise<ProductCategory> => {
      try {
        const category = await productCategoriesService.restore(id)

        toast.success(
          tc('messages.restored', { item: t('title.singular') })
        )

        // Recharger la liste
        fetchData()

        return category
      } catch (err) {
        handleApiError(err, 'restore product category', toast)
        throw err
      }
    },
    [toast, t, tc, fetchData]
  )

  return {
    // État
    data,
    total,
    loading,
    error,

    // Pagination
    params,
    setParams,

    // Actions CRUD
    create,
    update,
    delete: deleteItem,
    restore,

    // Recharger manuellement
    refetch: fetchData,
  }
}
