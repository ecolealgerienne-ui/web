/**
 * Hook React pour la gestion des produits médicaux
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MedicalProduct, MedicalProductFilters, CreateMedicalProductDto } from '@/lib/types/medical-product';
import { medicalProductsService } from '@/lib/services/medical-products.service';
import { logger } from '@/lib/utils/logger';

interface UseMedicalProductsResult {
  medicalProducts: MedicalProduct[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createMedicalProduct: (data: CreateMedicalProductDto) => Promise<MedicalProduct>;
}

export function useMedicalProducts(filters?: MedicalProductFilters): UseMedicalProductsResult {
  const [medicalProducts, setMedicalProducts] = useState<MedicalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Mémoiser les filtres pour éviter les re-renders inutiles
  const memoizedFilters = useMemo(() => filters, [
    filters?.search,
    filters?.scope,
    filters?.category,
    filters?.isActive,
  ]);

  const fetchMedicalProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await medicalProductsService.getAll(memoizedFilters);
      setMedicalProducts(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('Failed to fetch medical products in hook', { error });
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters]);

  useEffect(() => {
    fetchMedicalProducts();
  }, [fetchMedicalProducts]);

  const createMedicalProduct = useCallback(async (data: CreateMedicalProductDto): Promise<MedicalProduct> => {
    const newProduct = await medicalProductsService.create(data);
    setMedicalProducts(prev => [...prev, newProduct]);
    return newProduct;
  }, []);

  return {
    medicalProducts,
    loading,
    error,
    refetch: fetchMedicalProducts,
    createMedicalProduct,
  };
}
