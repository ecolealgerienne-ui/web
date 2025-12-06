/**
 * Hook React pour la gestion des catégories de produits
 * Utilise l'endpoint /api/v1/product-categories
 */

import { useState, useEffect, useCallback } from 'react'
import { ProductCategory } from '@/lib/types/admin/product-category'
import { productCategoriesService } from '@/lib/services/admin/product-categories.service'
import { logger } from '@/lib/utils/logger'

interface UseProductCategoriesResult {
  categories: ProductCategory[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useProductCategories(): UseProductCategoriesResult {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Récupérer toutes les catégories actives
      const response = await productCategoriesService.getAll({
        page: 1,
        limit: 100,
        sortOrder: 'asc',
      })

      // Filtrer pour ne garder que les catégories actives
      const activeCategories = response.data.filter(c => c.isActive !== false)

      setCategories(activeCategories)
      logger.info('Product categories fetched successfully', { count: activeCategories.length })
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch product categories in hook', { error })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  }
}
