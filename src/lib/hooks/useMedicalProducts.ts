/**
 * Hook React pour la gestion des produits médicaux
 */

import { useState, useEffect, useCallback } from 'react';
import { MedicalProduct, MedicalProductFilters } from '@/lib/types/medical-product';
import { medicalProductsService } from '@/lib/services/medical-products.service';
import { logger } from '@/lib/utils/logger';

interface UseMedicalProductsResult {
  medicalProducts: MedicalProduct[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useMedicalProducts(filters?: MedicalProductFilters): UseMedicalProductsResult {
  const [medicalProducts, setMedicalProducts] = useState<MedicalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMedicalProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await medicalProductsService.getAll(filters);
      setMedicalProducts(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('Failed to fetch medical products in hook', { error });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMedicalProducts();
  }, [fetchMedicalProducts]);

  return {
    medicalProducts,
    loading,
    error,
    refetch: fetchMedicalProducts,
  };
}
