/**
 * Hook React pour la gestion des produits médicaux
 */

import { useState, useEffect, useCallback } from 'react';
import { MedicalProduct, MedicalProductFilters } from '@/lib/services/medical-products.service';
import { medicalProductsService } from '@/lib/services/medical-products.service';
import { logger } from '@/lib/utils/logger';

interface UseMedicalProductsResult {
  products: MedicalProduct[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useMedicalProducts(filters?: Partial<MedicalProductFilters>): UseMedicalProductsResult {
  const [products, setProducts] = useState<MedicalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    logger.info('useMedicalProducts: Starting fetch', { filters });
    setLoading(true);
    setError(null);

    try {
      const data = await medicalProductsService.getAll(filters);
      logger.info('useMedicalProducts: Data received', { count: data.length, data });
      setProducts(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('Failed to fetch medical products in hook', { error: error.message, stack: error.stack });
    } finally {
      setLoading(false);
      logger.info('useMedicalProducts: Fetch completed');
    }
  }, [filters?.search, filters?.category, filters?.type, filters?.isActive]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
}
