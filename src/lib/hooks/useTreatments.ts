/**
 * Hook React pour la gestion des traitements
 */

import { useState, useEffect, useCallback } from 'react';
import { Treatment, TreatmentFilters } from '@/lib/types/treatment';
import { treatmentsService } from '@/lib/services/treatments.service';
import { logger } from '@/lib/utils/logger';

interface UseTreatmentsResult {
  treatments: Treatment[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTreatments(
  filters?: Partial<TreatmentFilters> & { animalId?: string }
): UseTreatmentsResult {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTreatments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await treatmentsService.getAll(filters);
      setTreatments(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('Failed to fetch treatments in hook', { error });
    } finally {
      setLoading(false);
    }
  }, [
    filters?.animalId,
    filters?.status,
    filters?.type,
    filters?.dateFrom,
    filters?.dateTo,
    filters?.search,
    filters?.targetType,
  ]);

  useEffect(() => {
    fetchTreatments();
  }, [fetchTreatments]);

  return {
    treatments,
    loading,
    error,
    refetch: fetchTreatments,
  };
}
