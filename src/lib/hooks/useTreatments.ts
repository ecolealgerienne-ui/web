import { useState, useEffect, useCallback } from 'react';
import { treatmentsService, CreateTreatmentDto, UpdateTreatmentDto } from '@/lib/services/treatments.service';
import type { Treatment, TreatmentFilters } from '@/lib/types/treatment';
import { logger } from '@/lib/utils/logger';

interface UseTreatmentsResult {
  treatments: Treatment[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createTreatment: (data: CreateTreatmentDto) => Promise<Treatment>;
  updateTreatment: (id: string, data: UpdateTreatmentDto) => Promise<Treatment>;
  deleteTreatment: (id: string) => Promise<void>;
}

export function useTreatments(filters?: Partial<TreatmentFilters>): UseTreatmentsResult {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Stabiliser les filtres pour éviter les boucles infinies
  const filtersKey = JSON.stringify(filters);

  const fetchTreatments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await treatmentsService.getAll(filters);
      setTreatments(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch treatments');
      setError(error);
      logger.error('Error fetching treatments', err);
    } finally {
      setLoading(false);
    }
  }, [filtersKey]);

  useEffect(() => {
    fetchTreatments();
  }, [fetchTreatments]);

  const createTreatment = useCallback(async (data: CreateTreatmentDto) => {
    const treatment = await treatmentsService.create(data);
    await fetchTreatments();
    return treatment;
  }, [fetchTreatments]);

  const updateTreatment = useCallback(async (id: string, data: UpdateTreatmentDto) => {
    const treatment = await treatmentsService.update(id, data);
    await fetchTreatments();
    return treatment;
  }, [fetchTreatments]);

  const deleteTreatment = useCallback(async (id: string) => {
    await treatmentsService.delete(id);
    await fetchTreatments();
  }, [fetchTreatments]);

  return {
    treatments,
    loading,
    error,
    refresh: fetchTreatments,
    createTreatment,
    updateTreatment,
    deleteTreatment,
  };
}
