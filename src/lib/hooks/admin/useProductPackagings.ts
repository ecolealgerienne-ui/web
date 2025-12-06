import { useState, useEffect, useCallback } from 'react'
import {
  productPackagingsService,
  type ProductPackagingFilterParams,
} from '@/lib/services/admin/product-packagings.service'
import type {
  ProductPackaging,
  CreateProductPackagingDto,
  UpdateProductPackagingDto,
} from '@/lib/types/admin/product-packaging'
import { useToast } from '@/contexts/toast-context'
import { handleApiError } from '@/lib/utils/api-error-handler'

/**
 * Hook personnalisé pour gérer les Conditionnements de Produits (Product Packagings)
 *
 * ✅ RÈGLE #7 : Hook personnalisé pour encapsuler la logique CRUD
 * ✅ RÈGLE #8 : Gestion d'erreurs avec handleApiError
 * ✅ RÈGLE #8 : Toast notifications pour succès/erreurs
 * ✅ RÈGLE Section 8.3.24 : Utilise response.meta.total
 *
 * Pattern: Scoped Reference Data (Scope: Product)
 *
 * @param initialParams - Paramètres de filtrage initiaux
 * @returns Objet contenant data, total, loading, params, et fonctions CRUD
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
 *   delete: deletePackaging,
 *   restore,
 *   refetch
 * } = useProductPackagings({ productId: 'prod-123', page: 1, limit: 25 })
 * ```
 */
export function useProductPackagings(initialParams: ProductPackagingFilterParams = {}) {
  // États
  const [data, setData] = useState<ProductPackaging[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [params, setParams] = useState<ProductPackagingFilterParams>({
    page: 1,
    limit: 25,
    sortBy: 'packagingLabel',
    sortOrder: 'asc',
    ...initialParams,
  })

  // Contexte toast pour notifications
  const toast = useToast()

  /**
   * Récupérer la liste des conditionnements
   * ✅ RÈGLE Section 7.4 : useCallback pour fonction dans dépendances
   */
  const fetchPackagings = useCallback(async () => {
    setLoading(true)
    try {
      const response = await productPackagingsService.getAll(params)
      setData(response.data)
      setTotal(response.meta.total)
    } catch (error) {
      handleApiError(error, 'productPackagings.fetch', toast)
      setData([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [params, toast])

  /**
   * Effet pour charger les données au montage et quand params change
   * ✅ RÈGLE Section 7.4 : Dépendances exhaustives
   */
  useEffect(() => {
    fetchPackagings()
  }, [fetchPackagings])

  /**
   * Créer un nouveau conditionnement
   *
   * @param data - Données de création
   * @returns Promise<ProductPackaging | null>
   */
  const create = async (data: CreateProductPackagingDto): Promise<ProductPackaging | null> => {
    try {
      const packaging = await productPackagingsService.create(data)
      toast.success('productPackaging.messages.createSuccess')
      await fetchPackagings() // Rafraîchir la liste
      return packaging
    } catch (error) {
      handleApiError(error, 'productPackagings.create', toast)
      return null
    }
  }

  /**
   * Mettre à jour un conditionnement existant
   *
   * @param id - ID du conditionnement
   * @param data - Données de mise à jour
   * @returns Promise<ProductPackaging | null>
   */
  const update = async (
    id: string,
    data: UpdateProductPackagingDto
  ): Promise<ProductPackaging | null> => {
    try {
      const packaging = await productPackagingsService.update(id, data)
      toast.success('productPackaging.messages.updateSuccess')
      await fetchPackagings() // Rafraîchir la liste
      return packaging
    } catch (error) {
      handleApiError(error, 'productPackagings.update', toast)
      return null
    }
  }

  /**
   * Supprimer un conditionnement (soft delete)
   *
   * @param id - ID du conditionnement
   * @returns Promise<boolean> - true si succès, false sinon
   */
  const deletePackaging = async (id: string): Promise<boolean> => {
    try {
      await productPackagingsService.delete(id)
      toast.success('productPackaging.messages.deleteSuccess')
      await fetchPackagings() // Rafraîchir la liste
      return true
    } catch (error) {
      handleApiError(error, 'productPackagings.delete', toast)
      return false
    }
  }

  /**
   * Restaurer un conditionnement supprimé
   *
   * @param id - ID du conditionnement
   * @returns Promise<ProductPackaging | null>
   */
  const restore = async (id: string): Promise<ProductPackaging | null> => {
    try {
      const packaging = await productPackagingsService.restore(id)
      toast.success('productPackaging.messages.restoreSuccess')
      await fetchPackagings() // Rafraîchir la liste
      return packaging
    } catch (error) {
      handleApiError(error, 'productPackagings.restore', toast)
      return null
    }
  }

  /**
   * Rafraîchir manuellement les données
   */
  const refetch = useCallback(() => {
    fetchPackagings()
  }, [fetchPackagings])

  return {
    // Données
    data,
    total,
    loading,

    // Paramètres
    params,
    setParams,

    // Actions CRUD
    create,
    update,
    delete: deletePackaging,
    restore,

    // Utilitaires
    refetch,
  }
}
