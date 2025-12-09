import { useState, useEffect, useCallback } from 'react';
import { weighingsService } from '@/lib/services/weighings.service';
import type { Weighing, QueryWeightDto } from '@/lib/types/weighing';
import { logger } from '@/lib/utils/logger';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Params pour le hook (règle 7.7)
export interface WeighingFilterParams extends QueryWeightDto {
  search?: string;
}

const DEFAULT_PARAMS: WeighingFilterParams = {
  page: 1,
  limit: 25,
};

interface UseWeighingsResult {
  weighings: Weighing[];
  total: number;
  loading: boolean;
  error: Error | null;
  params: WeighingFilterParams;
  setParams: React.Dispatch<React.SetStateAction<WeighingFilterParams>>;
  refetch: () => Promise<void>;
}

/**
 * Hook pour gérer les pesées avec pagination serveur
 * Utilise le pattern params/setParams (règle 7.7)
 */
export function useWeighings(initialParams?: Partial<WeighingFilterParams>): UseWeighingsResult {
  const [params, setParams] = useState<WeighingFilterParams>({
    ...DEFAULT_PARAMS,
    ...initialParams,
  });
  const [weighings, setWeighings] = useState<Weighing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWeighings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Extraire les params pour l'API (sans search qui est client-side)
      const { search, ...apiParams } = params;

      const response = await weighingsService.getAll(apiParams);
      setWeighings(response.data);
      setTotal(response.meta.total);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch weighings');
      setError(error);
      logger.error('Error fetching weighings', { error: err });
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchWeighings();
  }, [fetchWeighings]);

  return {
    weighings,
    total,
    loading,
    error,
    params,
    setParams,
    refetch: fetchWeighings,
  };
}
