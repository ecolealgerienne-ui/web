/**
 * Hook React pour le catalogue produits avec filtres côté serveur
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { Product, CatalogFilters } from '@/lib/types/admin/product'
import { catalogService } from '@/lib/services/catalog.service'
import { logger } from '@/lib/utils/logger'

interface UseCatalogProductsResult {
  products: Product[]
  loading: boolean
  error: Error | null
  total: number
  page: number
  totalPages: number
  hasMore: boolean
  loadMore: () => void
  refetch: () => Promise<void>
}

const DEFAULT_LIMIT = 50

export function useCatalogProducts(
  farmId: string | undefined,
  filters?: CatalogFilters
): UseCatalogProductsResult {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  // Track if we're loading more (pagination) vs initial load
  const isLoadingMore = useRef(false)

  const fetchProducts = useCallback(async (pageNum: number, append: boolean = false) => {
    if (!farmId) {
      setLoading(false)
      return
    }

    if (!append) {
      setLoading(true)
    }
    setError(null)

    try {
      const response = await catalogService.getProducts(farmId, {
        ...filters,
        page: pageNum,
        limit: filters?.limit || DEFAULT_LIMIT,
      })

      if (append) {
        setProducts(prev => [...prev, ...response.data])
      } else {
        setProducts(response.data)
      }

      setTotal(response.meta.total)
      setPage(response.meta.page)
      setTotalPages(response.meta.totalPages)

      logger.info('Catalog products loaded', {
        page: pageNum,
        count: response.data.length,
        total: response.meta.total,
      })
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch catalog products', { error, farmId, filters })
    } finally {
      setLoading(false)
      isLoadingMore.current = false
    }
  }, [farmId, filters])

  // Reset and fetch when filters change
  useEffect(() => {
    setPage(1)
    setProducts([])
    fetchProducts(1, false)
  }, [fetchProducts])

  const loadMore = useCallback(() => {
    if (isLoadingMore.current || page >= totalPages) return

    isLoadingMore.current = true
    const nextPage = page + 1
    fetchProducts(nextPage, true)
  }, [page, totalPages, fetchProducts])

  const refetch = useCallback(async () => {
    setPage(1)
    setProducts([])
    await fetchProducts(1, false)
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    total,
    page,
    totalPages,
    hasMore: page < totalPages,
    loadMore,
    refetch,
  }
}
