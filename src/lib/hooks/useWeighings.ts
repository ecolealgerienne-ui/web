import { useState, useEffect, useCallback, useMemo } from 'react';
import { weighingsService } from '@/lib/services/weighings.service';
import type { Weighing, QueryWeightDto, CreateWeightDto, UpdateWeightDto } from '@/lib/types/weighing';
import { logger } from '@/lib/utils/logger';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseWeighingsResult {
  weighings: Weighing[];
  meta: PaginationMeta;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createWeighing: (data: CreateWeightDto) => Promise<Weighing>;
  updateWeighing: (id: string, data: UpdateWeightDto) => Promise<Weighing>;
  deleteWeighing: (id: string) => Promise<void>;
}

export function useWeighings(filters?: QueryWeightDto & { search?: string }): UseWeighingsResult {
  const [weighings, setWeighings] = useState<Weighing[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Extract filter values to avoid unnecessary re-renders
  const filterAnimalId = filters?.animalId;
  const filterSource = filters?.source;
  const filterFromDate = filters?.fromDate;
  const filterToDate = filters?.toDate;
  const filterPage = filters?.page;
  const filterLimit = filters?.limit;
  const filterSort = filters?.sort;
  const filterOrder = filters?.order;

  const memoizedFilters = useMemo(() => ({
    animalId: filterAnimalId,
    source: filterSource,
    fromDate: filterFromDate,
    toDate: filterToDate,
    page: filterPage,
    limit: filterLimit,
    sort: filterSort,
    order: filterOrder,
  }), [filterAnimalId, filterSource, filterFromDate, filterToDate, filterPage, filterLimit, filterSort, filterOrder]);

  const fetchWeighings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await weighingsService.getAll(memoizedFilters);
      setWeighings(response.data);
      setMeta(response.meta);
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

  const createWeighing = useCallback(async (data: CreateWeightDto) => {
    const weighing = await weighingsService.create(data);
    await fetchWeighings();
    return weighing;
  }, [fetchWeighings]);

  const updateWeighing = useCallback(async (id: string, data: UpdateWeightDto) => {
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
    meta,
    loading,
    error,
    refresh: fetchWeighings,
    createWeighing,
    updateWeighing,
    deleteWeighing,
  };
}
