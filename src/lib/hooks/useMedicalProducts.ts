/**
 * Hook React pour la gestion des produits médicaux (READ ONLY)
 */

import { useState, useEffect, useCallback } from 'react';
import { MedicalProduct } from '@/lib/types/medical-product';
import { medicalProductsService } from '@/lib/services/medical-products.service';
import { useToast } from '@/contexts/toast-context';
import { useCommonTranslations } from '@/lib/i18n';
import { logger } from '@/lib/utils/logger';

interface UseMedicalProductsResult {
  products: MedicalProduct[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useMedicalProducts(): UseMedicalProductsResult {
  const toast = useToast();
  const tc = useCommonTranslations();
  const [products, setProducts] = useState<MedicalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await medicalProductsService.getAll();
      setProducts(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('Failed to fetch medical products in hook', { error });
      toast.error(tc('messages.error'), tc('messages.loadError'));
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
