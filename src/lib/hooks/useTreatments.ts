/**
 * Hook React pour la gestion des traitements
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
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

  // Extraire les valeurs des filtres pour éviter les re-renders inutiles
  const filterAnimalId = filters?.animalId;
  const filterSearch = filters?.search;
  const filterStatus = filters?.status;
  const filterType = filters?.type;
  const filterTargetType = filters?.targetType;
  const filterDateFrom = filters?.dateFrom;
  const filterDateTo = filters?.dateTo;

  const memoizedFilters = useMemo(() => ({
    animalId: filterAnimalId,
    search: filterSearch,
    status: filterStatus,
    type: filterType,
    targetType: filterTargetType,
    dateFrom: filterDateFrom,
    dateTo: filterDateTo,
  }), [filterAnimalId, filterSearch, filterStatus, filterType, filterTargetType, filterDateFrom, filterDateTo]);

  const fetchTreatments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await treatmentsService.getAll(memoizedFilters);
      setTreatments(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('Failed to fetch treatments in hook', { error });
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters]);

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
