/**
 * Hook React pour la gestion des traitements
 * Conforme aux normes DEVELOPMENT_STANDARDS.md (règle 7.7)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Treatment, CreateTreatmentDto, UpdateTreatmentDto } from '@/lib/types/treatment';
import { treatmentsService, TreatmentFilterParams } from '@/lib/services/treatments.service';
import { logger } from '@/lib/utils/logger';

interface UseTreatmentsResult {
  treatments: Treatment[];
  total: number;
  loading: boolean;
  error: Error | null;
  params: TreatmentFilterParams;
  setParams: React.Dispatch<React.SetStateAction<TreatmentFilterParams>>;
  refetch: () => Promise<void>;
  createTreatment: (data: CreateTreatmentDto) => Promise<Treatment>;
  updateTreatment: (id: string, data: UpdateTreatmentDto) => Promise<Treatment>;
  deleteTreatment: (id: string) => Promise<void>;
}

const DEFAULT_PARAMS: TreatmentFilterParams = {
  page: 1,
  limit: 25,
};

export function useTreatments(initialParams?: Partial<TreatmentFilterParams>): UseTreatmentsResult {
  const [allTreatments, setAllTreatments] = useState<Treatment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<TreatmentFilterParams>({
    ...DEFAULT_PARAMS,
    ...initialParams,
  });

  const fetchTreatments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Filtres envoyés à l'API (sans search qui est client-side)
      const apiParams = { ...params };
      delete apiParams.search;

      const response = await treatmentsService.getAll(apiParams);
      setAllTreatments(response.data);
      setTotal(response.meta.total);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('Failed to fetch treatments in hook', { error });
    } finally {
      setLoading(false);
    }
  }, [params]);

  // Filtrage client-side pour la recherche
  const treatments = useMemo(() => {
    const search = params.search;
    if (!search) return allTreatments;

    const searchLower = search.toLowerCase();
    return allTreatments.filter((treatment) => {
      const animalMatch =
        treatment.animal?.officialNumber?.toLowerCase().includes(searchLower) ||
        treatment.animal?.visualId?.toLowerCase().includes(searchLower) ||
        treatment.animal?.currentEid?.toLowerCase().includes(searchLower);
      const productMatch = treatment.productName?.toLowerCase().includes(searchLower);
      const vetMatch =
        treatment.veterinarianName?.toLowerCase().includes(searchLower) ||
        treatment.veterinarian?.lastName?.toLowerCase().includes(searchLower);
      const diagnosisMatch = treatment.diagnosis?.toLowerCase().includes(searchLower);

      return animalMatch || productMatch || vetMatch || diagnosisMatch;
    });
  }, [allTreatments, params.search]);

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
    total,
    loading,
    error,
    params,
    setParams,
    refetch: fetchTreatments,
    createTreatment,
    updateTreatment,
    deleteTreatment,
  };
}
