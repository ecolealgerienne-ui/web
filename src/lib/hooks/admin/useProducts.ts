'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/contexts/toast-context'
import { useTranslations } from 'next-intl'
import { productsService } from '@/lib/services/admin/products.service'
import { handleApiError } from '@/lib/utils/api-error-handler'
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductFilters,
} from '@/lib/types/admin/product'
import type { PaginationParams } from '@/lib/types/common/api'

/**
 * Hook personnalisé pour gérer les produits vétérinaires
 *
 * ✅ RÈGLE #6 : i18n pour tous les messages
 * ✅ RÈGLE #7 : Gestion d'erreurs avec handleApiError
 *
 * @param initialParams - Paramètres de pagination et filtres initiaux
 * @returns État et fonctions CRUD pour les produits
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
 * } = useProducts({ page: 1, limit: 25, search: 'Amox' })
 * ```
 */
export function useProducts(
  initialParams?: PaginationParams & ProductFilters
) {
  const toast = useToast()
  const t = useTranslations('product')
  const tc = useTranslations('common')

  // État local
  const [data, setData] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [params, setParams] = useState<PaginationParams & ProductFilters>(
    initialParams || {
      page: 1,
      limit: 25,
      sortBy: 'commercialName',
      sortOrder: 'asc',
    }
  )

  /**
   * Charge les produits avec les paramètres actuels
   */
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await productsService.getAll(params)
      setData(response.data)
      setTotal(response.meta.total)
    } catch (err) {
      setError(err as Error)
      handleApiError(err, 'fetch products', toast)
    } finally {
      setLoading(false)
    }
  }, [params, toast])

  /**
   * Crée un nouveau produit
   *
   * @param dto - Données du produit à créer
   * @returns Produit créé
   */
  const create = useCallback(
    async (dto: CreateProductDto) => {
      try {
        const product = await productsService.create(dto)
        toast.success(tc('messages.success'), t('messages.created'))
        await fetchData()
        return product
      } catch (err) {
        handleApiError(err, 'create product', toast, {
          409: t('messages.createError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Met à jour un produit existant
   *
   * @param id - ID du produit
   * @param dto - Données à mettre à jour (doit inclure version)
   * @returns Produit mis à jour
   */
  const update = useCallback(
    async (id: string, dto: UpdateProductDto) => {
      try {
        const product = await productsService.update(id, dto)
        toast.success(tc('messages.success'), t('messages.updated'))
        await fetchData()
        return product
      } catch (err) {
        handleApiError(err, 'update product', toast, {
          409: t('messages.updateError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Supprime un produit (soft delete)
   *
   * @param id - ID du produit à supprimer
   */
  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await productsService.delete(id)
        toast.success(tc('messages.success'), t('messages.deleted'))
        await fetchData()
      } catch (err) {
        handleApiError(err, 'delete product', toast, {
          409: t('messages.deleteError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Restaure un produit supprimé
   *
   * @param id - ID du produit à restaurer
   * @returns Produit restauré
   */
  const restore = useCallback(
    async (id: string) => {
      try {
        const product = await productsService.restore(id)
        toast.success(tc('messages.success'), t('messages.restored'))
        await fetchData()
        return product
      } catch (err) {
        handleApiError(err, 'restore product', toast)
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
