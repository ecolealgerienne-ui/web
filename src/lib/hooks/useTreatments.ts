/**
 * Hook React pour la gestion des traitements
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Treatment, TreatmentFilters, CreateTreatmentDto, UpdateTreatmentDto } from '@/lib/types/treatment';
import { treatmentsService } from '@/lib/services/treatments.service';
import { logger } from '@/lib/utils/logger';

export function useTreatments(filters?: Partial<TreatmentFilters>) {
  const [allTreatments, setAllTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Extraire les valeurs des filtres pour éviter les re-renders inutiles
  const filterSearch = filters?.search;
  const filterStatus = filters?.status;
  const filterType = filters?.type;
  const filterAnimalId = filters?.animalId;
  const filterProductId = filters?.productId;
  const filterLotId = filters?.lotId;
  const filterFromDate = filters?.fromDate;
  const filterToDate = filters?.toDate;

  // Filtres envoyés à l'API (sans search qui est client-side)
  const apiFilters = useMemo(() => ({
    status: filterStatus,
    type: filterType,
    animalId: filterAnimalId,
    productId: filterProductId,
    lotId: filterLotId,
    fromDate: filterFromDate,
    toDate: filterToDate,
  }), [filterStatus, filterType, filterAnimalId, filterProductId, filterLotId, filterFromDate, filterToDate]);

  const fetchTreatments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await treatmentsService.getAll(apiFilters);
      setAllTreatments(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('Failed to fetch treatments in hook', { error });
    } finally {
      setLoading(false);
    }
  }, [apiFilters]);

  // Filtrage client-side pour la recherche
  const treatments = useMemo(() => {
    if (!filterSearch) return allTreatments;

    const searchLower = filterSearch.toLowerCase();
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
  }, [allTreatments, filterSearch]);

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
