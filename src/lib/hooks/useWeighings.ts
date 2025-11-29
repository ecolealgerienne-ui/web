import { useState, useEffect, useCallback, useMemo } from 'react';
import { weighingsService } from '@/lib/services/weighings.service';
import type { Weighing, WeighingFilters, CreateWeighingDto, UpdateWeighingDto } from '@/lib/types/weighing';
import { logger } from '@/lib/utils/logger';

interface UseWeighingsResult {
  weighings: Weighing[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createWeighing: (data: CreateWeighingDto) => Promise<Weighing>;
  updateWeighing: (id: string, data: UpdateWeighingDto) => Promise<Weighing>;
  deleteWeighing: (id: string) => Promise<void>;
}

export function useWeighings(filters?: Partial<WeighingFilters>): UseWeighingsResult {
  const [weighings, setWeighings] = useState<Weighing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Extraire les valeurs des filtres pour éviter les re-renders inutiles
  const filterSearch = filters?.search;
  const filterPurpose = filters?.purpose;
  const filterDateFrom = filters?.dateFrom;
  const filterDateTo = filters?.dateTo;
  const filterMinWeight = filters?.minWeight;
  const filterMaxWeight = filters?.maxWeight;
  const filterAnimalId = filters?.animalId;
  const filterSource = filters?.source;

  const memoizedFilters = useMemo(() => ({
    search: filterSearch,
    purpose: filterPurpose,
    dateFrom: filterDateFrom,
    dateTo: filterDateTo,
    minWeight: filterMinWeight,
    maxWeight: filterMaxWeight,
    animalId: filterAnimalId,
    source: filterSource,
  }), [filterSearch, filterPurpose, filterDateFrom, filterDateTo, filterMinWeight, filterMaxWeight, filterAnimalId, filterSource]);

  const fetchWeighings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await weighingsService.getAll(memoizedFilters);
      setWeighings(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch weighings');
      setError(error);
      logger.error('Error fetching weighings', { error: err });
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters]);

  useEffect(() => {
    fetchWeighings();
  }, [fetchWeighings]);

  const createWeighing = useCallback(async (data: CreateWeighingDto) => {
    const weighing = await weighingsService.create(data);
    await fetchWeighings();
    return weighing;
  }, [fetchWeighings]);

  const updateWeighing = useCallback(async (id: string, data: UpdateWeighingDto) => {
    const weighing = await weighingsService.update(id, data);
    await fetchWeighings();
    return weighing;
  }, [fetchWeighings]);

  const deleteWeighing = useCallback(async (id: string) => {
    await weighingsService.delete(id);
    await fetchWeighings();
  }, [fetchWeighings]);

  return {
    weighings,
    loading,
    error,
    refresh: fetchWeighings,
    createWeighing,
    updateWeighing,
    deleteWeighing,
  };
}
