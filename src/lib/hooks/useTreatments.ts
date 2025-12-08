/**
 * Hook React pour la gestion des traitements
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Treatment, TreatmentFilters, CreateTreatmentDto, UpdateTreatmentDto } from '@/lib/types/treatment';
import { treatmentsService } from '@/lib/services/treatments.service';
import { logger } from '@/lib/utils/logger';

export function useTreatments(filters?: Partial<TreatmentFilters>) {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Extraire les valeurs des filtres pour éviter les re-renders inutiles
  const filterSearch = filters?.search;
  const filterStatus = filters?.status;
  const filterType = filters?.type;
  const filterAnimalId = filters?.animalId;
  const filterDateFrom = filters?.dateFrom;
  const filterDateTo = filters?.dateTo;

  const memoizedFilters = useMemo(() => ({
    search: filterSearch,
    status: filterStatus,
    type: filterType,
    animalId: filterAnimalId,
    dateFrom: filterDateFrom,
    dateTo: filterDateTo,
  }), [filterSearch, filterStatus, filterType, filterAnimalId, filterDateFrom, filterDateTo]);

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

  const createTreatment = async (data: CreateTreatmentDto): Promise<Treatment> => {
    const newTreatment = await treatmentsService.create(data);
    await fetchTreatments();
    return newTreatment;
  };

  const updateTreatment = async (id: string, data: UpdateTreatmentDto): Promise<Treatment> => {
    const updatedTreatment = await treatmentsService.update(id, data);
    await fetchTreatments();
    return updatedTreatment;
  };

  const deleteTreatment = async (id: string): Promise<void> => {
    await treatmentsService.delete(id);
    await fetchTreatments();
  };

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
