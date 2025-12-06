/**
 * Hook React pour la gestion des produits globaux
 * Utilise l'endpoint /api/v1/products pour afficher tous les produits disponibles
 */

import { useState, useEffect, useCallback } from 'react'
import { Product } from '@/lib/types/admin/product'
import { productsService } from '@/lib/services/admin/products.service'
import { logger } from '@/lib/utils/logger'

interface UseGlobalProductsParams {
  categoryId?: string
  search?: string
  therapeuticForm?: string
}

interface UseGlobalProductsResult {
  products: Product[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useGlobalProducts(params?: UseGlobalProductsParams): UseGlobalProductsResult {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Récupérer tous les produits actifs
      const response = await productsService.getAll({
        limit: 200, // Récupérer plus de produits pour le TransferList
        search: params?.search,
        therapeuticForm: params?.therapeuticForm,
      })

      // Filtrer par catégorie si spécifié (côté client car l'API ne supporte pas categoryId directement)
      let filteredProducts = response.data.filter(p => p.isActive !== false)

      // Note: Le filtrage par categoryId devrait être fait côté API si possible
      // Pour l'instant, on garde tous les produits et le filtrage sera fait dans le composant

      setProducts(filteredProducts)
      logger.info('Global products fetched successfully', { count: filteredProducts.length })
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch global products in hook', { error })
    } finally {
      setLoading(false)
    }
  }, [params?.search, params?.therapeuticForm])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  }
}
