/**
 * Hook React pour la gestion des vaccinations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Vaccination, VaccinationFilters } from '@/lib/types/vaccination';
import { vaccinationsService } from '@/lib/services/vaccinations.service';
import { logger } from '@/lib/utils/logger';

interface UseVaccinationsResult {
  vaccinations: Vaccination[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useVaccinations(
  filters?: Partial<VaccinationFilters> & { animalId?: string }
): UseVaccinationsResult {
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Extraire les valeurs des filtres pour éviter les re-renders inutiles
  const filterAnimalId = filters?.animalId;
  const filterSearch = filters?.search;
  const filterStatus = filters?.status;
  const filterTargetType = filters?.targetType;
  const filterDateFrom = filters?.dateFrom;
  const filterDateTo = filters?.dateTo;

  const memoizedFilters = useMemo(() => ({
    animalId: filterAnimalId,
    search: filterSearch,
    status: filterStatus,
    targetType: filterTargetType,
    dateFrom: filterDateFrom,
    dateTo: filterDateTo,
  }), [filterAnimalId, filterSearch, filterStatus, filterTargetType, filterDateFrom, filterDateTo]);

  const fetchVaccinations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await vaccinationsService.getAll(memoizedFilters);
      setVaccinations(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('Failed to fetch vaccinations in hook', { error });
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters]);

  useEffect(() => {
    fetchVaccinations();
  }, [fetchVaccinations]);

  return {
    vaccinations,
    loading,
    error,
    refetch: fetchVaccinations,
  };
}
